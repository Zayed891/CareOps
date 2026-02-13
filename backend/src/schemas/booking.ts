import { z } from 'zod';

export const createServiceTypeSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name is required"),
        description: z.string().optional(),
        duration: z.number().int().positive("Duration must be a positive number"),
        price: z.number().nonnegative("Price cannot be negative").optional(),
        location: z.string().optional(),
        isActive: z.boolean().optional(),
    }),
});

export const createBookingSchema = z.object({
    body: z.object({
        contactId: z.string().uuid("Invalid contact ID").optional().or(z.string().cuid()),
        serviceTypeId: z.string().cuid("Invalid service type ID"),
        scheduledAt: z.string().datetime("Invalid date format"),
        notes: z.string().optional(),
        // Check if we allow creating a contact inline? The types suggested separate Contact creation or ID.
        // Based on previous code, we might need contact details if ID isn't provided, but for now let's stick to ID.
        // Actually, looking at types/booking.ts, request usually has contactId.
    }),
});

export const updateBookingStatusSchema = z.object({
    body: z.object({
        status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']),
    }),
});

export const availabilitySchema = z.object({
    body: z.object({
        serviceTypeId: z.string().cuid("Invalid service type ID"),
        dayOfWeek: z.number().min(0).max(6),
        startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
        endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
    }),
});
