import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../db';
import automationEngine from '../services/automationEngine';

// GET /api/contacts
export const getContacts = async (req: AuthRequest, res: Response) => {
    try {
        const workspaceId = req.user?.workspaceId;
        const { page = '1', limit = '20', search } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = { workspaceId };
        if (search) {
            where.OR = [
                { name: { contains: String(search), mode: 'insensitive' } },
                { email: { contains: String(search), mode: 'insensitive' } },
                { phone: { contains: String(search) } },
            ];
        }

        const [contacts, total] = await Promise.all([
            prisma.contact.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: { select: { bookings: true, conversations: true, formSubmissions: true } },
                },
            }),
            prisma.contact.count({ where }),
        ]);

        res.json({
            data: contacts,
            meta: { total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) },
        });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ error: 'Failed to fetch contacts' });
    }
};

// GET /api/contacts/:id
export const getContact = async (req: AuthRequest, res: Response) => {
    try {
        const id = String(req.params.id);
        const contact = await prisma.contact.findFirst({
            where: { id, workspaceId: req.user?.workspaceId },
            include: {
                bookings: { orderBy: { scheduledAt: 'desc' }, take: 5, include: { serviceType: true } },
                conversations: { orderBy: { updatedAt: 'desc' }, take: 5 },
                formSubmissions: { orderBy: { createdAt: 'desc' }, take: 5, include: { template: true } },
            },
        });

        if (!contact) return res.status(404).json({ error: 'Contact not found' });
        res.json(contact);
    } catch (error) {
        console.error('Error fetching contact:', error);
        res.status(500).json({ error: 'Failed to fetch contact' });
    }
};

// POST /api/contacts
export const createContact = async (req: AuthRequest, res: Response) => {
    try {
        const { name, email, phone } = req.body;
        const workspaceId = req.user?.workspaceId!;

        // Check for duplicate
        if (email) {
            const existing = await prisma.contact.findFirst({ where: { email, workspaceId } });
            if (existing) return res.status(409).json({ error: 'Contact with this email already exists' });
        }

        const contact = await prisma.contact.create({
            data: { name, email, phone, workspaceId },
        });

        // Auto-create a conversation for this contact
        await prisma.conversation.create({
            data: { contactId: contact.id },
        });

        res.status(201).json(contact);

        // Fire automation event (non-blocking)
        automationEngine.emit('contact_created', workspaceId, { contactId: contact.id, name, email, phone });
    } catch (error) {
        console.error('Error creating contact:', error);
        res.status(500).json({ error: 'Failed to create contact' });
    }
};

// PUT /api/contacts/:id
export const updateContact = async (req: AuthRequest, res: Response) => {
    try {
        const id = String(req.params.id);
        const existing = await prisma.contact.findFirst({
            where: { id, workspaceId: req.user?.workspaceId },
        });
        if (!existing) return res.status(404).json({ error: 'Contact not found' });

        const contact = await prisma.contact.update({
            where: { id },
            data: req.body,
        });
        res.json(contact);
    } catch (error) {
        console.error('Error updating contact:', error);
        res.status(500).json({ error: 'Failed to update contact' });
    }
};

// DELETE /api/contacts/:id
export const deleteContact = async (req: AuthRequest, res: Response) => {
    try {
        const id = String(req.params.id);
        const existing = await prisma.contact.findFirst({
            where: { id, workspaceId: req.user?.workspaceId },
        });
        if (!existing) return res.status(404).json({ error: 'Contact not found' });

        await prisma.$transaction(async (tx: any) => {
            // 1. Get conversations to delete their messages
            const conversations = await tx.conversation.findMany({
                where: { contactId: id },
                select: { id: true }
            });
            const conversationIds = conversations.map((c: any) => c.id);

            // 2. Delete messages
            if (conversationIds.length > 0) {
                await tx.message.deleteMany({
                    where: { conversationId: { in: conversationIds } }
                });
            }

            // 3. Delete conversations
            await tx.conversation.deleteMany({ where: { contactId: id } });

            // 4. Delete form submissions
            await tx.formSubmission.deleteMany({ where: { contactId: id } });

            // 5. Delete bookings
            await tx.booking.deleteMany({ where: { contactId: id } });

            // 6. Delete the contact
            await tx.contact.delete({ where: { id } });
        });

        res.json({ message: 'Contact and all related data deleted' });
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({ error: 'Failed to delete contact' });
    }
};

