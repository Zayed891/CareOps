import { z } from 'zod';

const formFieldSchema = z.object({
    id: z.string().optional(), // Frontend might generate temp IDs
    label: z.string().min(1, "Label is required"),
    type: z.enum(['text', 'number', 'date', 'checkbox', 'select', 'textarea']),
    required: z.boolean(),
    options: z.array(z.string()).optional(),
});

export const createFormTemplateSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name is required"),
        description: z.string().optional(),
        fields: z.array(formFieldSchema).min(1, "At least one field is required"),
    }),
});

export const updateFormTemplateSchema = z.object({
    body: z.object({
        name: z.string().min(2).optional(),
        description: z.string().optional(),
        fields: z.array(formFieldSchema).optional(),
        isActive: z.boolean().optional(),
    }),
});

export const submitFormSchema = z.object({
    body: z.object({
        templateId: z.string().cuid("Invalid template ID"),
        data: z.record(z.string(), z.any()), // We can't strictly validate structure here without dynamic schema generation
        contactId: z.string().cuid().optional(), // If linked to a contact
    }),
});
