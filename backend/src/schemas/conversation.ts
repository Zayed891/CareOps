import { z } from 'zod';

export const sendMessageSchema = z.object({
    body: z.object({
        content: z.string().min(1, 'Message content is required'),
        channel: z.enum(['EMAIL', 'SMS']).default('EMAIL'),
    }),
});
