import { z } from 'zod';

export const createInventoryItemSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name is required"),
        description: z.string().optional(),
        quantity: z.number().int().nonnegative(),
        unit: z.string().min(1, "Unit is required"),
        reorderLevel: z.number().int().nonnegative().optional(),
        category: z.string().optional(),
        lowStockThreshold: z.number().int().nonnegative().optional(),
    }),
});

export const updateInventoryItemSchema = z.object({
    body: z.object({
        name: z.string().min(2).optional(),
        description: z.string().optional(),
        quantity: z.number().int().nonnegative().optional(),
        unit: z.string().min(1).optional(),
        reorderLevel: z.number().int().nonnegative().optional(),
        category: z.string().optional(),
        lowStockThreshold: z.number().int().nonnegative().optional(),
    }),
});

export const updateStockSchema = z.object({
    body: z.object({
        quantity: z.number().int().optional(),
        adjustment: z.number().int().optional(),
    }).refine(data => data.quantity !== undefined || data.adjustment !== undefined, {
        message: "Either quantity or adjustment must be provided",
    }),
});

export const createAlertSchema = z.object({
    body: z.object({
        itemId: z.string().cuid("Invalid item ID"),
        threshold: z.number().int().positive(),
        isActive: z.boolean().optional(),
    }),
});
