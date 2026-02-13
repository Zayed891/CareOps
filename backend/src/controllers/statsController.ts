import { Request, Response } from 'express';
import prisma from '../db';
import { startOfDay, endOfDay, startOfMonth, subDays } from 'date-fns';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const workspaceId = req.user?.workspaceId;

        if (!workspaceId) {
            console.error('Dashboard stats: No workspaceId in token. User:', JSON.stringify(req.user));
            return res.status(400).json({ error: 'Workspace ID required. Please log out and log in again.' });
        }

        const now = new Date();
        const todayStart = startOfDay(now);
        const todayEnd = endOfDay(now);
        const monthStart = startOfMonth(now);

        const [
            totalBookings,
            todayBookings,
            upcomingBookings,
            completedBookings,
            noShowBookings,
            pendingBookings,
            cancelledBookings,
            totalInventoryItems,
            activeForms,
            recentSubmissions,
            pendingForms,
            overdueForms,
            completedForms,
            totalContacts,
            newContacts,
            totalConversations,
        ] = await Promise.all([
            prisma.booking.count({ where: { contact: { workspaceId } } }),
            prisma.booking.count({
                where: {
                    contact: { workspaceId },
                    scheduledAt: { gte: todayStart, lte: todayEnd },
                    status: { not: 'CANCELLED' },
                },
            }),
            prisma.booking.count({
                where: {
                    contact: { workspaceId },
                    scheduledAt: { gt: now },
                    status: { not: 'CANCELLED' },
                },
            }),
            prisma.booking.count({
                where: { contact: { workspaceId }, status: 'COMPLETED' },
            }),
            prisma.booking.count({
                where: { contact: { workspaceId }, status: 'NO_SHOW' },
            }),
            prisma.booking.count({
                where: {
                    contact: { workspaceId },
                    status: 'PENDING',
                    scheduledAt: { gte: now },
                },
            }),
            prisma.booking.count({
                where: { contact: { workspaceId }, status: 'CANCELLED' },
            }),
            prisma.inventoryItem.count({ where: { workspaceId } }),
            prisma.formTemplate.count({ where: { workspaceId } }),
            prisma.formSubmission.count({
                where: { template: { workspaceId }, createdAt: { gte: monthStart } },
            }),
            prisma.formSubmission.count({
                where: { template: { workspaceId }, status: 'PENDING' },
            }),
            prisma.formSubmission.count({
                where: { template: { workspaceId }, status: 'OVERDUE' },
            }),
            prisma.formSubmission.count({
                where: { template: { workspaceId }, status: 'COMPLETED' },
            }),
            prisma.contact.count({ where: { workspaceId } }),
            prisma.contact.count({
                where: { workspaceId, createdAt: { gte: monthStart } },
            }),
            prisma.conversation.count({ where: { contact: { workspaceId } } }),
        ]);

        // ── Unanswered conversations: last message is INBOUND ──
        let unansweredConversations = 0;
        try {
            const result = await prisma.$queryRaw<[{ count: bigint }]>`
                SELECT COUNT(*)::bigint as count
                FROM "Conversation" c
                JOIN "Contact" co ON c."contactId" = co.id
                WHERE co."workspaceId" = ${workspaceId}
                AND EXISTS (
                    SELECT 1 FROM "Message" m 
                    WHERE m."conversationId" = c.id
                )
                AND (
                    SELECT m.direction FROM "Message" m 
                    WHERE m."conversationId" = c.id 
                    ORDER BY m."createdAt" DESC LIMIT 1
                ) = 'INBOUND'
            `;
            unansweredConversations = Number(result[0]?.count ?? 0);
        } catch {
            unansweredConversations = 0;
        }

        // ── New conversations this week ──
        const weekStart = subDays(now, 7);
        const newConversations = await prisma.conversation.count({
            where: {
                contact: { workspaceId },
                createdAt: { gte: weekStart },
            },
        });

        // ── Low stock items ──
        let lowStockItems = 0;
        let criticalStockItems = 0;
        try {
            const lowResult = await prisma.$queryRaw<[{ count: bigint }]>`
                SELECT COUNT(*)::bigint as count 
                FROM "InventoryItem" 
                WHERE "workspaceId" = ${workspaceId} 
                AND "quantity" <= "lowStockThreshold" 
                AND "lowStockThreshold" > 0
            `;
            lowStockItems = Number(lowResult[0]?.count ?? 0);

            const criticalResult = await prisma.$queryRaw<[{ count: bigint }]>`
                SELECT COUNT(*)::bigint as count 
                FROM "InventoryItem" 
                WHERE "workspaceId" = ${workspaceId} 
                AND "quantity" = 0
                AND "lowStockThreshold" > 0
            `;
            criticalStockItems = Number(criticalResult[0]?.count ?? 0);
        } catch {
            lowStockItems = 0;
            criticalStockItems = 0;
        }

        // ── Build alerts list ──
        const alerts: Array<{ type: string; message: string; severity: 'warning' | 'critical'; link: string }> = [];

        if (unansweredConversations > 0) {
            alerts.push({
                type: 'unanswered_messages',
                message: `${unansweredConversations} unanswered conversation${unansweredConversations > 1 ? 's' : ''}`,
                severity: unansweredConversations > 5 ? 'critical' : 'warning',
                link: '/inbox',
            });
        }

        if (pendingBookings > 0) {
            alerts.push({
                type: 'unconfirmed_bookings',
                message: `${pendingBookings} unconfirmed upcoming booking${pendingBookings > 1 ? 's' : ''}`,
                severity: pendingBookings > 3 ? 'critical' : 'warning',
                link: '/bookings',
            });
        }

        if (overdueForms > 0) {
            alerts.push({
                type: 'overdue_forms',
                message: `${overdueForms} overdue form${overdueForms > 1 ? 's' : ''}`,
                severity: 'warning',
                link: '/forms',
            });
        }

        if (criticalStockItems > 0) {
            alerts.push({
                type: 'critical_inventory',
                message: `${criticalStockItems} item${criticalStockItems > 1 ? 's' : ''} out of stock`,
                severity: 'critical',
                link: '/inventory?lowStock=true',
            });
        } else if (lowStockItems > 0) {
            alerts.push({
                type: 'low_inventory',
                message: `${lowStockItems} item${lowStockItems > 1 ? 's' : ''} running low`,
                severity: 'warning',
                link: '/inventory?lowStock=true',
            });
        }

        if (pendingForms > 0) {
            alerts.push({
                type: 'pending_forms',
                message: `${pendingForms} form${pendingForms > 1 ? 's' : ''} awaiting completion`,
                severity: 'warning',
                link: '/forms',
            });
        }

        res.json({
            bookings: {
                total: totalBookings,
                today: todayBookings,
                upcoming: upcomingBookings,
                completed: completedBookings,
                noShow: noShowBookings,
                pending: pendingBookings,
                cancelled: cancelledBookings,
            },
            inventory: {
                totalItems: totalInventoryItems,
                lowStock: lowStockItems,
                criticalStock: criticalStockItems,
            },
            forms: {
                activeTemplates: activeForms,
                monthlySubmissions: recentSubmissions,
                pending: pendingForms,
                overdue: overdueForms,
                completed: completedForms,
            },
            contacts: {
                total: totalContacts,
                newThisMonth: newContacts,
            },
            conversations: {
                total: totalConversations,
                unanswered: unansweredConversations,
                newThisWeek: newConversations,
            },
            alerts,
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
};
