import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../db';

// GET /api/integrations
export const getIntegrations = async (req: AuthRequest, res: Response) => {
    try {
        const integrations = await prisma.integration.findMany({
            where: { workspaceId: req.user?.workspaceId },
            orderBy: { createdAt: 'desc' },
        });
        res.json(integrations);
    } catch (error) {
        console.error('Error fetching integrations:', error);
        res.status(500).json({ error: 'Failed to fetch integrations' });
    }
};

// POST /api/integrations
export const createIntegration = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'OWNER') {
            return res.status(403).json({ error: 'Only owners can manage integrations' });
        }

        const { type, config, isActive } = req.body;
        const workspaceId = req.user.workspaceId;

        // Check if integration of this type already exists
        const existing = await prisma.integration.findFirst({
            where: { workspaceId, type },
        });
        if (existing) {
            return res.status(409).json({ error: `${type} integration already exists. Update it instead.` });
        }

        const integration = await prisma.integration.create({
            data: { workspaceId, type, config, isActive: isActive ?? true },
        });

        res.status(201).json(integration);
    } catch (error) {
        console.error('Error creating integration:', error);
        res.status(500).json({ error: 'Failed to create integration' });
    }
};

// PUT /api/integrations/:id
export const updateIntegration = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'OWNER') {
            return res.status(403).json({ error: 'Only owners can manage integrations' });
        }

        const id = String(req.params.id);
        const existing = await prisma.integration.findFirst({
            where: { id, workspaceId: req.user.workspaceId },
        });
        if (!existing) return res.status(404).json({ error: 'Integration not found' });

        const integration = await prisma.integration.update({
            where: { id },
            data: req.body,
        });
        res.json(integration);
    } catch (error) {
        console.error('Error updating integration:', error);
        res.status(500).json({ error: 'Failed to update integration' });
    }
};

// DELETE /api/integrations/:id
export const deleteIntegration = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'OWNER') {
            return res.status(403).json({ error: 'Only owners can manage integrations' });
        }

        const id = String(req.params.id);
        const existing = await prisma.integration.findFirst({
            where: { id, workspaceId: req.user.workspaceId },
        });
        if (!existing) return res.status(404).json({ error: 'Integration not found' });

        await prisma.integration.delete({ where: { id } });
        res.json({ message: 'Integration deleted' });
    } catch (error) {
        console.error('Error deleting integration:', error);
        res.status(500).json({ error: 'Failed to delete integration' });
    }
};
