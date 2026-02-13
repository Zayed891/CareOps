import { z } from 'zod';

export const inviteStaffSchema = z.object({
    body: z.object({
        email: z.string().email('Valid email required'),
        name: z.string().min(1, 'Name is required'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        permissions: z.object({
            canAccessInbox: z.boolean().default(true),
            canManageBookings: z.boolean().default(true),
            canViewForms: z.boolean().default(true),
            canViewInventory: z.boolean().default(true),
            canModifySettings: z.boolean().default(false),
        }).optional(),
    }),
});

export const updatePermissionsSchema = z.object({
    body: z.object({
        canAccessInbox: z.boolean().optional(),
        canManageBookings: z.boolean().optional(),
        canViewForms: z.boolean().optional(),
        canViewInventory: z.boolean().optional(),
        canModifySettings: z.boolean().optional(),
    }),
});
