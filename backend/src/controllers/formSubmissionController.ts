import { Response } from 'express';
import { AuthRequest } from '../types/express';
import prisma from '../db';

// Get all submissions for a form template
export const getFormSubmissions = async (req: AuthRequest, res: Response) => {
    try {
        const formId = req.params.formId as string;
        const { workspaceId } = req.user;
        const {
            page = '1',
            limit = '10',
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Pagination
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        // Verify form template belongs to workspace
        const template = await prisma.formTemplate.findFirst({
            where: { id: formId, workspaceId },
        });

        if (!template) {
            return res.status(404).json({ error: 'Form template not found' });
        }

        const where: any = { templateId: formId };

        const [total, submissions] = await prisma.$transaction([
            prisma.formSubmission.count({ where }),
            prisma.formSubmission.findMany({
                where,
                include: {
                    contact: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                        },
                    },
                    booking: {
                        select: {
                            id: true,
                            scheduledAt: true,
                            status: true,
                        },
                    },
                },
                orderBy: { [sortBy as string]: sortOrder as 'asc' | 'desc' },
                take: limitNum,
                skip,
            })
        ]);

        res.json({
            data: submissions,
            meta: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Get form submissions error:', error);
        res.status(500).json({ error: 'Failed to fetch form submissions' });
    }
};

// Get single submission
export const getSubmission = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { workspaceId } = req.user;

        const submission = await prisma.formSubmission.findFirst({
            where: {
                id,
                template: { workspaceId },
            },
            include: {
                template: {
                    include: {
                        fields: {
                            orderBy: { order: 'asc' },
                        },
                    },
                },
                contact: true,
                booking: true,
            },
        });

        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        res.json(submission);
    } catch (error) {
        console.error('Get submission error:', error);
        res.status(500).json({ error: 'Failed to fetch submission' });
    }
};

// Submit form
export const submitForm = async (req: AuthRequest, res: Response) => {
    try {
        const formId = req.params.formId as string;
        const { workspaceId } = req.user;
        const { contactId, bookingId, data } = req.body;

        if (!contactId || !data) {
            return res.status(400).json({ error: 'Contact ID and form data are required' });
        }

        // Verify form template belongs to workspace and include fields
        const template = await prisma.formTemplate.findFirst({
            where: { id: formId, workspaceId },
            include: {
                fields: true,
            },
        });

        if (!template) {
            return res.status(404).json({ error: 'Form template not found' });
        }

        // Verify contact belongs to workspace
        const contact = await prisma.contact.findFirst({
            where: { id: contactId, workspaceId },
        });

        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        // Validate required fields
        const requiredFields = template.fields.filter((f: any) => f.required);
        for (const field of requiredFields) {
            if (!data[field.label] || data[field.label] === '') {
                return res.status(400).json({
                    error: `Required field missing: ${field.label}`,
                });
            }
        }

        const submission = await prisma.formSubmission.create({
            data: {
                templateId: formId,
                contactId,
                bookingId,
                data,
            },
            include: {
                template: true,
                contact: true,
            },
        });

        res.status(201).json(submission);
    } catch (error) {
        console.error('Submit form error:', error);
        res.status(500).json({ error: 'Failed to submit form' });
    }
};

// Update submission
export const updateSubmission = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { workspaceId } = req.user;
        const { data } = req.body;

        const existing = await prisma.formSubmission.findFirst({
            where: {
                id,
                template: { workspaceId },
            },
        });

        if (!existing) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        const submission = await prisma.formSubmission.update({
            where: { id },
            data: {
                ...(data && { data }),
            },
            include: {
                template: true,
                contact: true,
            },
        });

        res.json(submission);
    } catch (error) {
        console.error('Update submission error:', error);
        res.status(500).json({ error: 'Failed to update submission' });
    }
};

// Delete submission
export const deleteSubmission = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { workspaceId } = req.user;

        const existing = await prisma.formSubmission.findFirst({
            where: {
                id,
                template: { workspaceId },
            },
        });

        if (!existing) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        await prisma.formSubmission.delete({
            where: { id },
        });

        res.json({ message: 'Submission deleted successfully' });
    } catch (error) {
        console.error('Delete submission error:', error);
        res.status(500).json({ error: 'Failed to delete submission' });
    }
};
