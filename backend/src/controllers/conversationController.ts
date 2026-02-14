import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../db';
import automationEngine from '../services/automationEngine';
import { sendEmail } from '../services/emailService';
import { sendSms } from '../services/smsService';
import { getIO } from '../services/socketService';

// GET /api/conversations
export const getConversations = async (req: AuthRequest, res: Response) => {
    try {
        const workspaceId = req.user?.workspaceId;
        const { page = '1', limit = '20', channel } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const messageWhere: any = {};
        if (channel) messageWhere.channel = channel;

        const [conversations, total] = await Promise.all([
            prisma.conversation.findMany({
                where: { contact: { workspaceId } },
                skip,
                take: Number(limit),
                orderBy: { updatedAt: 'desc' },
                include: {
                    contact: true,
                    messages: { orderBy: { createdAt: 'desc' }, take: 1 },
                },
            }),
            prisma.conversation.count({ where: { contact: { workspaceId } } }),
        ]);

        res.json({
            data: conversations,
            meta: { total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) },
        });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
};

// GET /api/conversations/:id
export const getConversation = async (req: AuthRequest, res: Response) => {
    try {
        const id = String(req.params.id);
        const conversation = await prisma.conversation.findFirst({
            where: { id, contact: { workspaceId: req.user?.workspaceId } },
            include: {
                contact: true,
                messages: {
                    orderBy: { createdAt: 'asc' },
                    include: { sender: { select: { id: true, name: true, email: true } } },
                },
            },
        });

        if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
        res.json(conversation);
    } catch (error) {
        console.error('Error fetching conversation:', error);
        res.status(500).json({ error: 'Failed to fetch conversation' });
    }
};

// POST /api/conversations/:id/messages — Staff sends a reply
export const sendMessage = async (req: AuthRequest, res: Response) => {
    try {
        const id = String(req.params.id);
        const workspaceId = req.user?.workspaceId;

        const conversation = await prisma.conversation.findFirst({
            where: { id, contact: { workspaceId } },
            include: { contact: true },
        });
        if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

        const { content, channel } = req.body;
        const messageChannel = channel || 'EMAIL';

        const message = await prisma.message.create({
            data: {
                conversationId: conversation.id,
                senderId: req.user?.id,
                content,
                channel: messageChannel,
                direction: 'OUTBOUND',
            },
            include: { sender: { select: { id: true, name: true, email: true } } },
        });

        // Update conversation timestamp
        await prisma.conversation.update({
            where: { id: conversation.id },
            data: { updatedAt: new Date() },
        });

        // ── Attempt to actually send via integration ──
        let emailSent = false;
        let smsSent = false;
        let deliveryError = null;

        if (messageChannel === 'EMAIL' && conversation.contact?.email) {
            try {
                emailSent = await sendEmail({
                    to: conversation.contact.email,
                    subject: 'New message from your care team',
                    body: content,
                    workspaceId: workspaceId!,
                });
                if (!emailSent) {
                    deliveryError = 'Email service not configured. Check SendGrid API key in .env';
                }
            } catch (error) {
                console.error('Email send error:', error);
                deliveryError = 'Failed to send email. Check logs for details.';
            }
        } else if (messageChannel === 'SMS' && conversation.contact?.phone) {
            try {
                smsSent = await sendSms({
                    to: conversation.contact.phone,
                    body: content,
                    workspaceId: workspaceId!,
                });
                if (!smsSent) {
                    deliveryError = 'SMS service not configured. Check Twilio credentials in .env';
                }
            } catch (error) {
                console.error('SMS send error:', error);
                deliveryError = 'Failed to send SMS. Check logs for details.';
            }
        }

        res.status(201).json({
            ...message,
            emailSent,
            smsSent,
            deliveryError,
        });

        // ── Fire staff_reply automation event ──
        // This allows rules like "staff_reply → pause_automation" to work
        if (workspaceId) {
            automationEngine.emit('staff_reply', workspaceId, {
                conversationId: conversation.id,
                contactId: conversation.contactId,
                staffId: req.user?.id,
                channel: messageChannel,
            });
        }
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
};

// DELETE /api/conversations/:id — Delete a conversation
export const deleteConversation = async (req: AuthRequest, res: Response) => {
    try {
        const id = String(req.params.id);
        const workspaceId = req.user?.workspaceId;

        const conversation = await prisma.conversation.findFirst({
            where: { id, contact: { workspaceId } },
        });

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        // Delete all messages first (cascade)
        await prisma.message.deleteMany({
            where: { conversationId: id },
        });

        // Delete the conversation
        await prisma.conversation.delete({
            where: { id },
        });

        res.json({ message: 'Conversation deleted successfully' });
    } catch (error) {
        console.error('Error deleting conversation:', error);
        res.status(500).json({ error: 'Failed to delete conversation' });
    }
};

// POST /api/conversations/:id/messages/inbound — Manually record an inbound message (for testing)
export const recordInboundMessage = async (req: AuthRequest, res: Response) => {
    try {
        const id = String(req.params.id);
        const workspaceId = req.user?.workspaceId;

        const conversation = await prisma.conversation.findFirst({
            where: { id, contact: { workspaceId } },
            include: { contact: true },
        });

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        const { content, channel } = req.body;
        const messageChannel = channel || 'EMAIL';

        // 1. Create the message first
        const message = await prisma.message.create({
            data: {
                conversationId: conversation.id,
                content,
                channel: messageChannel,
                direction: 'INBOUND', // Customer message
            },
        });

        // 2. AI Analysis (Async - don't block response)
        let aiAnalysis = null;
        let draftReply = null;
        try {
            const { geminiService } = await import('../services/geminiService');

            // Analyze Intent
            aiAnalysis = await geminiService.analyzeIntent(content);
            console.log(`[AI Analysis] Message ${message.id}:`, aiAnalysis);

            // Generate Draft Reply (Auto-Draft)
            // We provide a simple context based on the message itself for now
            const context = `Customer: ${content}\n\nIntent: ${aiAnalysis.intent}`;
            draftReply = await geminiService.generateReply(context);

        } catch (aiError) {
            console.error('AI Analysis/Draft failed:', aiError);
        }

        // 3. Update conversation timestamp
        await prisma.conversation.update({
            where: { id: conversation.id },
            data: { updatedAt: new Date() },
        });

        // 4. Real-time notification
        try {
            const io = getIO();
            io.to(workspaceId!).emit('message:received', {
                conversationId: conversation.id,
                messageId: message.id,
                contactName: conversation.contact?.name,
                content: message.content,
                channel: message.channel,
                timestamp: message.createdAt,
                aiAnalysis,
                draftReply, // Send draft to frontend
            });
        } catch (err) {
            console.error('Socket emit error:', err);
        }

        res.status(201).json({ ...message, aiAnalysis });
    } catch (error) {
        console.error('Error recording inbound message:', error);
        res.status(500).json({ error: 'Failed to record inbound message' });
    }
};
