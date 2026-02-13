/**
 * Email Service — Abstraction layer for email providers.
 * 
 * Currently supports SendGrid. Falls back to logging if no integration is configured.
 * All methods fail gracefully and never break core flows.
 */

import sgMail from '@sendgrid/mail';
import prisma from '../db';
import { Logger as logger } from '../utils/logger';

interface SendEmailParams {
    to: string;
    subject: string;
    body: string;
    workspaceId: string;
}

/**
 * Look up the active EMAIL integration for a workspace and return its config.
 */
async function getEmailConfig(workspaceId: string) {
    const integration = await prisma.integration.findFirst({
        where: { workspaceId, type: 'EMAIL', isActive: true },
    });
    return integration?.config as Record<string, any> | null;
}

/**
 * Get the workspace owner's name and email + workspace name to use as the sender identity.
 */
async function getOwnerInfo(workspaceId: string) {
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    const owner = await prisma.user.findFirst({
        where: { workspaceId, role: 'OWNER' },
        select: { name: true, email: true },
    });
    return {
        ownerName: owner?.name || 'CareOps',
        ownerEmail: owner?.email || workspace?.contactEmail || '',
        workspaceName: workspace?.name || 'CareOps',
    };
}

/**
 * Send an email via SendGrid.
 * Falls back to logging if the provider is not set up or the send fails.
 * 
 * The "from" email is set to a verified SendGrid sender (from .env).
 * The "reply_to" is set to the workspace owner's email so customer replies
 * go directly to the business owner's inbox.
 */
export async function sendEmail({ to, subject, body, workspaceId }: SendEmailParams): Promise<boolean> {
    try {
        const config = await getEmailConfig(workspaceId);
        const apiKey = (config as any)?.apiKey || process.env.SENDGRID_API_KEY;

        if (!apiKey) {
            logger.info(`[EmailService] No SendGrid API key configured — logging email instead. To: ${to}, Subject: ${subject}`);
            return false;
        }

        // Initialize SendGrid with API key
        sgMail.setApiKey(apiKey);

        // Get owner info so the email appears to come from the business owner
        const { ownerName, ownerEmail, workspaceName } = await getOwnerInfo(workspaceId);

        // Get the verified sender email from config or env
        const fromEmail = (config as any)?.fromEmail || process.env.SENDGRID_FROM_EMAIL;
        
        if (!fromEmail) {
            logger.error('[EmailService] No SENDGRID_FROM_EMAIL configured');
            return false;
        }

        // Build the message
        const msg: any = {
            to,
            from: {
                email: fromEmail,
                name: `${ownerName} - ${workspaceName}`,
            },
            subject,
            html: body,
        };

        // Set reply-to so customer replies go to the owner's real email
        // This is crucial for inbound email handling!
        if (ownerEmail) {
            msg.replyTo = {
                email: ownerEmail,
                name: ownerName,
            };
        }

        // Send email via SendGrid
        await sgMail.send(msg);

        logger.info(`[EmailService] Email sent via SendGrid to ${to}: "${subject}"`);
        return true;
    } catch (error: any) {
        logger.error('[EmailService] Failed to send email via SendGrid:', error?.response?.body || error);
        return false; // Never break core flows
    }
}

export default { sendEmail };
