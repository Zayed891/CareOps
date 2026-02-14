import { Router } from 'express';
import { generateReply, analyzeIntent } from '../controllers/aiController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Protect AI routes with authentication
router.post('/generate-reply', authMiddleware as any, generateReply as any);
router.post('/analyze-intent', authMiddleware as any, analyzeIntent as any);

export default router;
