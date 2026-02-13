import { z } from 'zod';

export const createAutomationRuleSchema = z.object({
    body: z.object({
        eventType: z.enum([
            'contact_created',
            'booking_created',
            'booking_reminder',
            'form_pending',
            'inventory_low',
            'staff_reply',
        ]),
        action: z.enum([
            'send_email',
            'send_sms',
            'create_alert',
            'pause_automation',
        ]),
        config: z.record(z.string(), z.any()).default({}),
        isActive: z.boolean().default(true),
    }),
});

export const updateAutomationRuleSchema = z.object({
    body: z.object({
        eventType: z.string().optional(),
        action: z.string().optional(),
        config: z.record(z.string(), z.any()).optional(),
        isActive: z.boolean().optional(),
    }),
});
