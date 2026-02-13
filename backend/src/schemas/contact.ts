import { z } from 'zod';

export const createContactSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email').optional().nullable(),
        phone: z.string().optional().nullable(),
    }).refine(data => data.email || data.phone, {
        message: 'At least one of email or phone is required',
    }),
});

export const updateContactSchema = z.object({
    body: z.object({
        name: z.string().min(1).optional(),
        email: z.string().email('Invalid email').optional().nullable(),
        phone: z.string().optional().nullable(),
    }),
});
