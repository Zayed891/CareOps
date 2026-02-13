import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { sendMessageSchema } from '../schemas/conversation';
import {
    getConversations,
    getConversation,
    sendMessage,
    deleteConversation,
    recordInboundMessage,
} from '../controllers/conversationController';

const router = Router();

router.use(authenticate as any);

router.get('/', getConversations as any);
router.get('/:id', getConversation as any);
router.post('/:id/messages', validate(sendMessageSchema), sendMessage as any);
router.post('/:id/messages/inbound', validate(sendMessageSchema), recordInboundMessage as any);
router.delete('/:id', deleteConversation as any);

export default router;
