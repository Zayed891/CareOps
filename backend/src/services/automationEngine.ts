/**
 * Automation Engine — Event listener + Action executor
 *
 * This module provides a lightweight, in-process event bus.
 * Backend controllers call `automationEngine.emit(eventType, workspaceId, payload)`
 * and the engine looks up matching active rules and executes their actions.
 */

import prisma from '../db';
import { Logger as logger } from '../utils/logger';
import { sendEmail } from './emailService';
import { sendSms } from './smsService';

// ── Template Helpers ─────────────────────────────────────────────────
function resolveTemplate(template: string | undefined, payload: Record<string, any>): string {
    if (!template) {
        // Default templates based on common events
        if (payload.serviceType && payload.scheduledAt) {
            return `Your booking for ${payload.serviceType} on ${new Date(payload.scheduledAt).toLocaleString()} has been confirmed. We look forward to seeing you!`;
        }
        return `Thank you for reaching out! We'll be in touch shortly.`;
    }
    // Replace {{key}} placeholders with payload values
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => payload[key] ?? '');
}

function resolveSubject(config: Record<string, any>, payload: Record<string, any>): string {
    if (config.subject) return config.subject;
    if (payload.serviceType) return `Booking Confirmation — ${payload.serviceType}`;
    return 'Notification from CareOps';
}

// ── Action Handlers ──────────────────────────────────────────────────

type ActionPayload = {
    workspaceId: string;
    ruleId: string;
    config: Record<string, any>;
    eventPayload: Record<string, any>;
};

const actionHandlers: Record<string, (p: ActionPayload) => Promise<void>> = {
    send_email: async ({ workspaceId, eventPayload, config }) => {
        const to = eventPayload.email;
        if (!to) {
            logger.warn('[AutomationEngine] send_email: No email in payload, skipping.');
            return;
        }
        const subject = resolveSubject(config, eventPayload);
        const body = resolveTemplate(config.template, eventPayload);

        const sent = await sendEmail({ to, subject, body, workspaceId });
        if (!sent) {
            logger.info(`[AutomationEngine] 📧 SEND_EMAIL (logged) → to: ${to}, subject: ${subject}`);
        }

        // Also record as a message in the conversation if we have a contactId
        if (eventPayload.contactId) {
            try {
                // Find or create conversation
                let conversation = await prisma.conversation.findFirst({
                    where: { contactId: eventPayload.contactId },
                });
                
                if (!conversation) {
                    // Create a new conversation if it doesn't exist
                    conversation = await prisma.conversation.create({
                        data: {
                            contactId: eventPayload.contactId,
                        },
                    });
                }
                
                // Create the message
                await prisma.message.create({
                    data: {
                        conversationId: conversation.id,
                        content: body,
                        channel: 'EMAIL',
                        direction: 'OUTBOUND',
                    },
                });
                
                // Update conversation timestamp
                await prisma.conversation.update({
                    where: { id: conversation.id },
                    data: { updatedAt: new Date() },
                });
            } catch (err) {
                logger.error('[AutomationEngine] Failed to record email in conversation:', err);
            }
        }
    },

    send_sms: async ({ workspaceId, eventPayload, config }) => {
        const to = eventPayload.phone;
        if (!to) {
            logger.warn('[AutomationEngine] send_sms: No phone in payload, skipping.');
            return;
        }
        const body = resolveTemplate(config.template, eventPayload);

        const sent = await sendSms({ to, body, workspaceId });
        if (!sent) {
            logger.info(`[AutomationEngine] 📱 SEND_SMS (logged) → to: ${to}, body: ${body.substring(0, 50)}...`);
        }

        // Record as a message in the conversation
        if (eventPayload.contactId) {
            try {
                // Find or create conversation
                let conversation = await prisma.conversation.findFirst({
                    where: { contactId: eventPayload.contactId },
                });
                
                if (!conversation) {
                    // Create a new conversation if it doesn't exist
                    conversation = await prisma.conversation.create({
                        data: {
                            contactId: eventPayload.contactId,
                        },
                    });
                }
                
                // Create the message
                await prisma.message.create({
                    data: {
                        conversationId: conversation.id,
                        content: body,
                        channel: 'SMS',
                        direction: 'OUTBOUND',
                    },
                });
                
                // Update conversation timestamp
                await prisma.conversation.update({
                    where: { id: conversation.id },
                    data: { updatedAt: new Date() },
                });
            } catch (err) {
                logger.error('[AutomationEngine] Failed to record SMS in conversation:', err);
            }
        }
    },

    create_alert: async ({ workspaceId, eventPayload, config }) => {
        logger.info(`[AutomationEngine] 🔔 CREATE_ALERT → workspace: ${workspaceId}`);

        // Log as activity
        try {
            await prisma.activityLog.create({
                data: {
                    action: 'ALERT',
                    details: {
                        workspaceId,
                        type: config.alertType || 'general',
                        message: config.message || JSON.stringify(eventPayload),
                        ...eventPayload,
                    },
                },
            });
        } catch (err) {
            logger.error('[AutomationEngine] Failed to create alert log:', err);
        }
    },

    pause_automation: async ({ workspaceId, ruleId, eventPayload }) => {
        // Pause all automation rules for this conversation/contact
        // When staff replies, we pause automation for that contact's conversation
        try {
            if (eventPayload.contactId) {
                // Find rules that target this contact and disable them temporarily
                // For simplicity, we create an activity log entry marking the pause
                await prisma.activityLog.create({
                    data: {
                        action: 'AUTOMATION_PAUSED',
                        details: {
                            workspaceId,
                            contactId: eventPayload.contactId,
                            reason: 'Staff replied to conversation',
                            ruleId,
                        },
                    },
                });
            }
        } catch (err) {
            logger.error('[AutomationEngine] Failed to log pause:', err);
        }
        logger.info(`[AutomationEngine] ⏸️  PAUSE_AUTOMATION → rule ${ruleId} paused for contact ${eventPayload.contactId || 'N/A'}`);
    },
};

// ── Engine ────────────────────────────────────────────────────────────

class AutomationEngine {
    /**
     * Emit an event. The engine will look up all active automation rules
     * for the given workspace that match the event type, and execute
     * their configured actions.
     */
    async emit(eventType: string, workspaceId: string, payload: Record<string, any> = {}) {
        try {
            const rules = await prisma.automationRule.findMany({
                where: {
                    workspaceId,
                    eventType,
                    isActive: true,
                },
            });

            if (rules.length === 0) return;

            logger.info(`[AutomationEngine] Event "${eventType}" → ${rules.length} matching rule(s) for workspace ${workspaceId}`);

            // Execute each matching rule's action concurrently
            await Promise.allSettled(
                rules.map(async (rule) => {
                    const handler = actionHandlers[rule.action];
                    if (!handler) {
                        logger.warn(`[AutomationEngine] Unknown action "${rule.action}" on rule ${rule.id}`);
                        return;
                    }

                    try {
                        await handler({
                            workspaceId,
                            ruleId: rule.id,
                            config: (rule.config as Record<string, any>) || {},
                            eventPayload: payload,
                        });
                    } catch (err) {
                        logger.error(`[AutomationEngine] Action "${rule.action}" failed for rule ${rule.id}:`, err);
                    }
                })
            );
        } catch (err) {
            logger.error('[AutomationEngine] Failed to process event:', err);
        }
    }
}

// Singleton
const automationEngine = new AutomationEngine();
export default automationEngine;
