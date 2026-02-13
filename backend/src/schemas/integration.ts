import { z } from 'zod';

export const createIntegrationSchema = z.object({
    body: z.object({
        type: z.enum(['EMAIL', 'SMS', 'CALENDAR']),
        config: z.record(z.string(), z.any()),
        isActive: z.boolean().default(true),
    }),
});

export const updateIntegrationSchema = z.object({
    body: z.object({
        config: z.record(z.string(), z.any()).optional(),
        isActive: z.boolean().optional(),
    }),
});
