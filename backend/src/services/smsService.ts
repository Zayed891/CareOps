/**
 * SMS Service — Abstraction layer for SMS providers.
 * 
 * Currently supports Twilio. Falls back to logging if no integration is configured.
 * All methods fail gracefully and never break core flows.
 */

import prisma from '../db';
import { Logger as logger } from '../utils/logger';

interface SendSmsParams {
    to: string;
    body: string;
    workspaceId: string;
}

/**
 * Look up the active SMS integration for a workspace and return its config.
 */
async function getSmsConfig(workspaceId: string) {
    const integration = await prisma.integration.findFirst({
        where: { workspaceId, type: 'SMS', isActive: true },
    });
    return integration?.config as Record<string, any> | null;
}

/**
 * Send an SMS via the configured provider (Twilio).
 * Falls back to logging if the provider is not set up or the send fails.
 */
export async function sendSms({ to, body, workspaceId }: SendSmsParams): Promise<boolean> {
    try {
        const config = await getSmsConfig(workspaceId);
        const accountSid = (config as any)?.accountSid || process.env.TWILIO_ACCOUNT_SID;
        const authToken = (config as any)?.authToken || process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = (config as any)?.phoneNumber || process.env.TWILIO_PHONE_NUMBER;

        if (!accountSid || !authToken || !fromNumber) {
            logger.info(`[SmsService] No Twilio credentials configured — logging SMS instead. To: ${to}, Body: ${body.substring(0, 50)}...`);
            return false;
        }

        // Use Twilio REST API directly (no extra dependency)
        const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
        const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({ To: to, From: fromNumber, Body: body }).toString(),
        });

        if (!response.ok) {
            const err = await response.text();
            logger.error(`[SmsService] Twilio API error: ${response.status} ${err}`);
            return false;
        }

        logger.info(`[SmsService] SMS sent to ${to}`);
        return true;
    } catch (error) {
        logger.error('[SmsService] Failed to send SMS:', error);
        return false; // Never break core flows
    }
}

export default { sendSms };
