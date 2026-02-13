import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../db';

// GET /api/automation-rules
export const getAutomationRules = async (req: AuthRequest, res: Response) => {
    try {
        const rules = await prisma.automationRule.findMany({
            where: { workspaceId: req.user?.workspaceId },
            orderBy: { createdAt: 'desc' },
        });
        res.json(rules);
    } catch (error) {
        console.error('Error fetching automation rules:', error);
        res.status(500).json({ error: 'Failed to fetch automation rules' });
    }
};

// POST /api/automation-rules
export const createAutomationRule = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'OWNER') {
            return res.status(403).json({ error: 'Only owners can manage automation rules' });
        }

        const { eventType, action, config, isActive } = req.body;

        const rule = await prisma.automationRule.create({
            data: {
                workspaceId: req.user.workspaceId,
                eventType, action, config: config || {},
                isActive: isActive ?? true,
            },
        });

        res.status(201).json(rule);
    } catch (error) {
        console.error('Error creating automation rule:', error);
        res.status(500).json({ error: 'Failed to create automation rule' });
    }
};

// PUT /api/automation-rules/:id
export const updateAutomationRule = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'OWNER') {
            return res.status(403).json({ error: 'Only owners can manage automation rules' });
        }

        const id = String(req.params.id);
        const existing = await prisma.automationRule.findFirst({
            where: { id, workspaceId: req.user.workspaceId },
        });
        if (!existing) return res.status(404).json({ error: 'Rule not found' });

        const rule = await prisma.automationRule.update({
            where: { id },
            data: req.body,
        });
        res.json(rule);
    } catch (error) {
        console.error('Error updating rule:', error);
        res.status(500).json({ error: 'Failed to update automation rule' });
    }
};

// DELETE /api/automation-rules/:id
export const deleteAutomationRule = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'OWNER') {
            return res.status(403).json({ error: 'Only owners can manage automation rules' });
        }

        const id = String(req.params.id);
        const existing = await prisma.automationRule.findFirst({
            where: { id, workspaceId: req.user.workspaceId },
        });
        if (!existing) return res.status(404).json({ error: 'Rule not found' });

        await prisma.automationRule.delete({ where: { id } });
        res.json({ message: 'Rule deleted' });
    } catch (error) {
        console.error('Error deleting rule:', error);
        res.status(500).json({ error: 'Failed to delete automation rule' });
    }
};
