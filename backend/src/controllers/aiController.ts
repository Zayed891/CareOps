import { Request, Response } from 'express';
import { geminiService } from '../services/geminiService';

export const generateReply = async (req: Request, res: Response) => {
    try {
        const { context } = req.body;

        if (!context) {
            return res.status(400).json({ error: 'Conversation context is required' });
        }

        const reply = await geminiService.generateReply(context);
        res.json({ reply });
    } catch (error) {
        console.error('Error generating reply:', error);
        res.status(500).json({ error: 'Failed to generate reply' });
    }
};
