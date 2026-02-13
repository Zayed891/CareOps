/**
 * Scheduler — Periodic jobs for booking reminders, form reminders, and inventory checks.
 * 
 * Uses setInterval for simplicity (no external dependency needed).
 * Each job runs independently and fails gracefully.
 */

import prisma from '../db';
import automationEngine from './automationEngine';
import { Logger as logger } from '../utils/logger';
import { addHours, subHours } from 'date-fns';

// ── Booking Reminders ────────────────────────────────────────────────
// Sends reminders for bookings scheduled within the next 24 hours
// that haven't been reminded yet (check via ActivityLog).
async function processBookingReminders() {
    try {
        const now = new Date();
        const in24Hours = addHours(now, 24);

        // Find upcoming bookings in the next 24 hours that are PENDING or CONFIRMED
        const bookings = await prisma.booking.findMany({
            where: {
                scheduledAt: { gte: now, lte: in24Hours },
                status: { in: ['PENDING', 'CONFIRMED'] },
            },
            include: {
                contact: true,
                serviceType: { include: { workspace: true } },
            },
        });

        for (const booking of bookings) {
            if (!booking.serviceType?.workspace) continue;
            const workspaceId = booking.serviceType.workspace.id;

            // Check if we already sent a reminder for this booking
            const alreadyReminded = await prisma.activityLog.findFirst({
                where: {
                    action: 'BOOKING_REMINDER_SENT',
                    details: { path: ['bookingId'], equals: booking.id },
                },
            });

            if (alreadyReminded) continue;

            // Emit reminder event
            automationEngine.emit('booking_reminder', workspaceId, {
                bookingId: booking.id,
                contactId: booking.contactId,
                email: booking.contact?.email,
                phone: booking.contact?.phone,
                serviceType: booking.serviceType?.name,
                scheduledAt: booking.scheduledAt,
            });

            // Record that we sent the reminder
            await prisma.activityLog.create({
                data: {
                    action: 'BOOKING_REMINDER_SENT',
                    details: { workspaceId, bookingId: booking.id, scheduledAt: booking.scheduledAt },
                },
            });

            logger.info(`[Scheduler] Booking reminder sent for booking ${booking.id}`);
        }
    } catch (error) {
        logger.error('[Scheduler] Error processing booking reminders:', error);
    }
}

// ── Form Reminders ───────────────────────────────────────────────────
// Sends reminders for forms that are PENDING for more than 24 hours
async function processFormReminders() {
    try {
        const cutoff = subHours(new Date(), 24);

        const pendingSubmissions = await prisma.formSubmission.findMany({
            where: {
                status: 'PENDING',
                createdAt: { lte: cutoff },
            },
            include: {
                contact: true,
                template: { include: { workspace: true } },
                booking: true,
            },
        });

        for (const submission of pendingSubmissions) {
            if (!submission.template?.workspace) continue;
            const workspaceId = submission.template.workspace.id;

            // Check if we already sent a reminder recently (within last 24h)
            const recentReminder = await prisma.activityLog.findFirst({
                where: {
                    action: 'FORM_REMINDER_SENT',
                    details: { path: ['submissionId'], equals: submission.id },
                    createdAt: { gte: subHours(new Date(), 24) },
                },
            });

            if (recentReminder) continue;

            automationEngine.emit('form_pending', workspaceId, {
                submissionId: submission.id,
                contactId: submission.contactId,
                email: submission.contact?.email,
                phone: submission.contact?.phone,
                formName: submission.template?.name,
                bookingId: submission.bookingId,
            });

            await prisma.activityLog.create({
                data: {
                    action: 'FORM_REMINDER_SENT',
                    details: { workspaceId, submissionId: submission.id },
                },
            });

            // Also mark as OVERDUE if older than 48 hours
            const overdueCutoff = subHours(new Date(), 48);
            if (submission.createdAt <= overdueCutoff) {
                await prisma.formSubmission.update({
                    where: { id: submission.id },
                    data: { status: 'OVERDUE' },
                });
            }

            logger.info(`[Scheduler] Form reminder sent for submission ${submission.id}`);
        }
    } catch (error) {
        logger.error('[Scheduler] Error processing form reminders:', error);
    }
}

// ── Inventory Checks ─────────────────────────────────────────────────
// Checks for low-stock items and emits inventory_low events
async function processInventoryChecks() {
    try {
        // Find items that are below their threshold
        const lowStockItems = await prisma.$queryRaw<Array<{
            id: string;
            name: string;
            quantity: number;
            lowStockThreshold: number;
            workspaceId: string;
        }>>`
            SELECT id, name, quantity, "lowStockThreshold", "workspaceId"
            FROM "InventoryItem"
            WHERE "lowStockThreshold" > 0 AND "quantity" <= "lowStockThreshold"
        `;

        for (const item of lowStockItems) {
            // Check if we already alerted recently (within last 24h)
            const recentAlert = await prisma.activityLog.findFirst({
                where: {
                    action: 'INVENTORY_LOW_ALERT',
                    details: { path: ['itemId'], equals: item.id },
                    createdAt: { gte: subHours(new Date(), 24) },
                },
            });

            if (recentAlert) continue;

            automationEngine.emit('inventory_low', item.workspaceId, {
                itemId: item.id,
                itemName: item.name,
                quantity: item.quantity,
                threshold: item.lowStockThreshold,
            });

            await prisma.activityLog.create({
                data: {
                    action: 'INVENTORY_LOW_ALERT',
                    details: { workspaceId: item.workspaceId, itemId: item.id, itemName: item.name, quantity: item.quantity },
                },
            });

            logger.info(`[Scheduler] Low stock alert for item ${item.name} (${item.quantity} remaining)`);
        }
    } catch (error) {
        logger.error('[Scheduler] Error processing inventory checks:', error);
    }
}

// ── Start Scheduler ──────────────────────────────────────────────────

export function startScheduler() {
    logger.info('[Scheduler] Starting scheduled jobs...');

    // Run booking reminders every 15 minutes
    setInterval(processBookingReminders, 15 * 60 * 1000);

    // Run form reminders every hour
    setInterval(processFormReminders, 60 * 60 * 1000);

    // Run inventory checks every 30 minutes
    setInterval(processInventoryChecks, 30 * 60 * 1000);

    // Also run once on startup (after a short delay)
    setTimeout(() => {
        processBookingReminders();
        processFormReminders();
        processInventoryChecks();
    }, 10_000); // 10s after startup
}
