import { Router } from 'express';
import { handleSendGridWebhook, handleTwilioWebhook } from '../controllers/webhookController';

const router = Router();

// Webhook endpoints (no auth required - external services call these)
router.post('/sendgrid', handleSendGridWebhook as any);
router.post('/twilio', handleTwilioWebhook as any);

export default router;
