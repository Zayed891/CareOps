import { Response } from 'express';
import { AuthRequest } from '../types/express';
import prisma from '../db';

// Get all form templates for workspace
export const getFormTemplates = async (req: AuthRequest, res: Response) => {
    try {
        const { workspaceId } = req.user;
        const {
            page = '1',
            limit = '10',
            sortBy = 'updatedAt',
            sortOrder = 'desc'
        } = req.query;

        // Pagination
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const where: any = { workspaceId };

        const [total, templates] = await prisma.$transaction([
            prisma.formTemplate.count({ where }),
            prisma.formTemplate.findMany({
                where,
                include: {
                    _count: {
                        select: { submissions: true },
                    },
                },
                orderBy: { [sortBy as string]: sortOrder as 'asc' | 'desc' },
                take: limitNum,
                skip,
            })
        ]);

        res.json({
            data: templates,
            meta: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Get form templates error:', error);
        res.status(500).json({ error: 'Failed to fetch form templates' });
    }
};

// Get single form template
export const getFormTemplate = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { workspaceId } = req.user;

        const template = await prisma.formTemplate.findFirst({
            where: { id, workspaceId },
            include: {
                fields: {
                    orderBy: { order: 'asc' },
                },
            },
        });

        if (!template) {
            return res.status(404).json({ error: 'Form template not found' });
        }

        res.json(template);
    } catch (error) {
        console.error('Get form template error:', error);
        res.status(500).json({ error: 'Failed to fetch form template' });
    }
};

// Create form template
export const createFormTemplate = async (req: AuthRequest, res: Response) => {
    try {
        const { workspaceId } = req.user;
        const { name, description, serviceTypeId, fields } = req.body;

        if (!name || !fields || !Array.isArray(fields)) {
            return res.status(400).json({ error: 'Name and fields array are required' });
        }

        const template = await prisma.formTemplate.create({
            data: {
                workspaceId,
                name,
                description,
                serviceTypeId,
                fields: {
                    create: fields.map((field: any, index: number) => ({
                        label: field.label,
                        fieldType: field.fieldType || 'text',
                        required: field.required || false,
                        options: field.options ?? undefined,
                        order: field.order !== undefined ? field.order : index,
                    })),
                },
            },
            include: {
                fields: {
                    orderBy: { order: 'asc' },
                },
            },
        });

        res.status(201).json(template);
    } catch (error) {
        console.error('Create form template error:', error);
        res.status(500).json({ error: 'Failed to create form template' });
    }
};

// Update form template
export const updateFormTemplate = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { workspaceId } = req.user;
        const { name, description, serviceTypeId, fields } = req.body;

        const existing = await prisma.formTemplate.findFirst({
            where: { id, workspaceId },
        });

        if (!existing) {
            return res.status(404).json({ error: 'Form template not found' });
        }

        // If fields are being updated, delete old ones and create new ones
        if (fields && Array.isArray(fields)) {
            await prisma.formField.deleteMany({
                where: { templateId: id },
            });
        }

        const template = await prisma.formTemplate.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(serviceTypeId !== undefined && { serviceTypeId }),
                ...(fields &&
                    Array.isArray(fields) && {
                    fields: {
                        create: fields.map((field: any, index: number) => ({
                            label: field.label,
                            fieldType: field.fieldType || 'text',
                            required: field.required || false,
                            options: field.options ?? undefined,
                            order: field.order !== undefined ? field.order : index,
                        })),
                    },
                }),
            },
            include: {
                fields: {
                    orderBy: { order: 'asc' },
                },
            },
        });

        res.json(template);
    } catch (error) {
        console.error('Update form template error:', error);
        res.status(500).json({ error: 'Failed to update form template' });
    }
};

// Delete form template
export const deleteFormTemplate = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { workspaceId } = req.user;

        const existing = await prisma.formTemplate.findFirst({
            where: { id, workspaceId },
        });

        if (!existing) {
            return res.status(404).json({ error: 'Form template not found' });
        }

        // Check if there are submissions
        const submissionsCount = await prisma.formSubmission.count({
            where: { templateId: id },
        });

        if (submissionsCount > 0) {
            return res.status(400).json({
                error: 'Cannot delete form template with existing submissions',
            });
        }

        // Delete fields first
        await prisma.formField.deleteMany({
            where: { templateId: id },
        });

        await prisma.formTemplate.delete({
            where: { id },
        });

        res.json({ message: 'Form template deleted successfully' });
    } catch (error) {
        console.error('Delete form template error:', error);
        res.status(500).json({ error: 'Failed to delete form template' });
    }
};

// Duplicate form template
export const duplicateFormTemplate = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { workspaceId } = req.user;

        const existing = await prisma.formTemplate.findFirst({
            where: { id, workspaceId },
            include: {
                fields: {
                    orderBy: { order: 'asc' },
                },
            },
        });

        if (!existing) {
            return res.status(404).json({ error: 'Form template not found' });
        }

        const duplicate = await prisma.formTemplate.create({
            data: {
                workspaceId,
                name: `${existing.name} (Copy)`,
                description: existing.description,
                serviceTypeId: existing.serviceTypeId,
                fields: {
                    create: existing.fields.map((field: any) => ({
                        label: field.label,
                        fieldType: field.fieldType,
                        required: field.required,
                        options: field.options ?? undefined,
                        order: field.order,
                    })),
                },
            },
            include: {
                fields: {
                    orderBy: { order: 'asc' },
                },
            },
        });

        res.status(201).json(duplicate);
    } catch (error) {
        console.error('Duplicate form template error:', error);
        res.status(500).json({ error: 'Failed to duplicate form template' });
    }
};
