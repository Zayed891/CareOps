import { Request, Response } from 'express';
import prisma from '../db';
import { Logger as logger } from '../utils/logger';

/**
 * Webhook Handler for Inbound Emails (SendGrid)
 * 
 * Configure SendGrid Inbound Parse:
 * 1. Go to https://app.sendgrid.com/settings/parse
 * 2. Add your domain and subdomain (e.g., inbound.yourdomain.com)
 * 3. Set Destination URL: https://your-domain.com/api/webhooks/sendgrid
 * 4. Click "Add Host & URL"
 * 
 * SendGrid will forward all emails sent to inbound.yourdomain.com to this webhook.
 */
export const handleSendGridWebhook = async (req: Request, res: Response) => {
    try {
        // SendGrid Inbound Parse sends data as multipart/form-data
        const { from, to, subject, text, html } = req.body;

        logger.info('[Webhook] SendGrid inbound email received from:', from);

        if (!from) {
            logger.warn('[Webhook] No sender email in SendGrid webhook');
            return res.status(400).json({ error: 'No sender email' });
        }

        // Extract customer email (SendGrid sends "Name <email@example.com>" format)
        const emailMatch = from.match(/<(.+?)>/) || [null, from];
        const customerEmail = emailMatch[1]?.trim() || from.trim();
        
        if (!customerEmail) {
            logger.warn('[Webhook] Could not extract email from:', from);
            return res.status(400).json({ error: 'Invalid sender format' });
        }

        // Find contact by email
        const contact = await prisma.contact.findFirst({
            where: { email: customerEmail },
        });

        if (!contact) {
            logger.info('[Webhook] Email from unknown contact:', customerEmail);
            return res.status(200).json({ message: 'Contact not found, ignoring' });
        }

        // Find or create conversation
        let conversation = await prisma.conversation.findFirst({
            where: { contactId: contact.id },
        });

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: { contactId: contact.id },
            });
        }

        // Extract message content (prefer text, fallback to HTML, fallback to subject)
        const messageContent = text || html || subject || 'No content';

        // Create inbound message
        await prisma.message.create({
            data: {
                conversationId: conversation.id,
                content: messageContent,
                channel: 'EMAIL',
                direction: 'INBOUND',
            },
        });

        // Update conversation timestamp
        await prisma.conversation.update({
            where: { id: conversation.id },
            data: { updatedAt: new Date() },
        });

        logger.info('[Webhook] Inbound email recorded for contact:', contact.name);
        res.status(200).json({ received: true });
    } catch (error) {
        logger.error('[Webhook] SendGrid webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
};

/**
 * Webhook Handler for Inbound SMS (Twilio)
 * 
 * Configure this endpoint in Twilio console:
 * Webhook URL: https://your-domain.com/api/webhooks/twilio
 * Method: POST
 * Content-Type: application/x-www-form-urlencoded
 */
export const handleTwilioWebhook = async (req: Request, res: Response) => {
    try {
        // Twilio sends data as form-encoded
        const { From, To, Body, MessageSid } = req.body;

        logger.info('[Webhook] Twilio SMS received from:', From);

        if (!From || !Body) {
            logger.warn('[Webhook] Invalid Twilio webhook payload');
            return res.status(400).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
        }

        // Normalize phone number (remove +1, spaces, dashes)
        const normalizedPhone = From.replace(/[\s\-\+]/g, '').slice(-10);

        // Find contact by phone
        const contact = await prisma.contact.findFirst({
            where: {
                OR: [
                    { phone: From },
                    { phone: normalizedPhone },
                    { phone: { contains: normalizedPhone } },
                ],
            },
        });

        if (!contact) {
            logger.info('[Webhook] SMS from unknown contact:', From);
            return res.status(200).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
        }

        // Find or create conversation
        let conversation = await prisma.conversation.findFirst({
            where: { contactId: contact.id },
        });

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: { contactId: contact.id },
            });
        }

        // Create inbound message
        await prisma.message.create({
            data: {
                conversationId: conversation.id,
                content: Body,
                channel: 'SMS',
                direction: 'INBOUND',
            },
        });

        // Update conversation timestamp
        await prisma.conversation.update({
            where: { id: conversation.id },
            data: { updatedAt: new Date() },
        });

        logger.info('[Webhook] Inbound SMS recorded for contact:', contact.name);

        // Twilio expects TwiML response
        res.type('text/xml');
        res.send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
    } catch (error) {
        logger.error('[Webhook] Twilio webhook error:', error);
        res.type('text/xml');
        res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
    }
};
