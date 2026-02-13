import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../db';
import { generateUniqueSlug } from '../utils/slugGenerator';

// PUT /api/workspace — Update workspace settings (Owner only)
export const updateWorkspace = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'OWNER') {
            return res.status(403).json({ error: 'Only owners can update workspace settings' });
        }

        const workspaceId = req.user.workspaceId;
        const { name, address, timezone, contactEmail } = req.body;

        // If name is being updated, generate a new slug
        let newSlug: string | undefined;
        if (name) {
            newSlug = await generateUniqueSlug(name, workspaceId);
        }

        const workspace = await prisma.workspace.update({
            where: { id: workspaceId },
            data: {
                ...(name && { name }),
                ...(newSlug && { slug: newSlug }),
                ...(address !== undefined && { address }),
                ...(timezone && { timezone }),
                ...(contactEmail && { contactEmail }),
            },
        });

        res.json(workspace);
    } catch (error) {
        console.error('Error updating workspace:', error);
        res.status(500).json({ error: 'Failed to update workspace' });
    }
};

// GET /api/workspace — Get workspace details
export const getWorkspace = async (req: AuthRequest, res: Response) => {
    try {
        const workspaceId = req.user?.workspaceId;
        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
        });

        if (!workspace) return res.status(404).json({ error: 'Workspace not found' });
        res.json(workspace);
    } catch (error) {
        console.error('Error fetching workspace:', error);
        res.status(500).json({ error: 'Failed to fetch workspace' });
    }
};

// POST /api/workspace/activate — Activate workspace after verification
export const activateWorkspace = async (req: AuthRequest, res: Response) => {
    try {
        if (req.user?.role !== 'OWNER') {
            return res.status(403).json({ error: 'Only owners can activate workspace' });
        }

        const workspaceId = req.user.workspaceId;

        // Run verification checks
        const [integrations, serviceTypes, availability] = await Promise.all([
            prisma.integration.count({ where: { workspaceId, isActive: true } }),
            prisma.serviceType.count({ where: { workspaceId } }),
            prisma.availability.count({
                where: { serviceType: { workspaceId } },
            }),
        ]);

        const checks = {
            hasIntegration: integrations > 0,
            hasServiceType: serviceTypes > 0,
            hasAvailability: availability > 0,
        };

        const allPassed = Object.values(checks).every(Boolean);

        if (!allPassed) {
            return res.status(400).json({
                error: 'Workspace cannot be activated. Please complete setup.',
                checks,
            });
        }

        const workspace = await prisma.workspace.update({
            where: { id: workspaceId },
            data: { isActive: true },
        });

        res.json({ message: 'Workspace activated successfully', workspace, checks });
    } catch (error) {
        console.error('Error activating workspace:', error);
        res.status(500).json({ error: 'Failed to activate workspace' });
    }
};

// GET /api/workspace/status — Get workspace setup status
export const getWorkspaceStatus = async (req: AuthRequest, res: Response) => {
    try {
        const workspaceId = req.user?.workspaceId;

        const [workspace, integrations, serviceTypes, availability, formTemplates, inventoryItems, staff] = await Promise.all([
            prisma.workspace.findUnique({ where: { id: workspaceId } }),
            prisma.integration.count({ where: { workspaceId, isActive: true } }),
            prisma.serviceType.count({ where: { workspaceId } }),
            prisma.availability.count({ where: { serviceType: { workspaceId } } }),
            prisma.formTemplate.count({ where: { workspaceId } }),
            prisma.inventoryItem.count({ where: { workspaceId } }),
            prisma.user.count({ where: { workspaceId } }),
        ]);

        res.json({
            workspace: {
                id: workspace?.id,
                name: workspace?.name,
                slug: workspace?.slug,
                isActive: workspace?.isActive,
            },
            setup: {
                workspace: true,
                integrations: integrations > 0,
                serviceTypes: serviceTypes > 0,
                availability: availability > 0,
                forms: formTemplates > 0,
                inventory: inventoryItems > 0,
                staff: staff > 1,
            },
            counts: { integrations, serviceTypes, availability, formTemplates, inventoryItems, staff },
        });
    } catch (error) {
        console.error('Error fetching workspace status:', error);
        res.status(500).json({ error: 'Failed to fetch workspace status' });
    }
};
