import { Response } from 'express';
import { AuthRequest } from './../types/express';
import prisma from '../db';

// Get all alerts
export const getInventoryAlerts = async (req: AuthRequest, res: Response) => {
    try {
        const { workspaceId } = req.user;
        const { active } = req.query;

        const alerts = await prisma.inventoryAlert.findMany({
            where: {
                item: { workspaceId },
                ...(active === 'true' && { isActive: true }),
            },
            include: {
                item: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        // Filter to show only alerts where current quantity is below threshold
        const triggeredAlerts = alerts.filter(
            (alert) => alert.item.quantity <= alert.threshold
        );

        res.json(triggeredAlerts);
    } catch (error) {
        console.error('Get inventory alerts error:', error);
        res.status(500).json({ error: 'Failed to fetch inventory alerts' });
    }
};

// Create alert
export const createInventoryAlert = async (req: AuthRequest, res: Response) => {
    try {
        const { workspaceId } = req.user;
        const { itemId, threshold } = req.body;

        if (!itemId || threshold === undefined) {
            return res.status(400).json({ error: 'Item ID and threshold are required' });
        }

        // Verify item belongs to workspace
        const item = await prisma.inventoryItem.findFirst({
            where: { id: itemId, workspaceId },
        });

        if (!item) {
            return res.status(404).json({ error: 'Inventory item not found' });
        }

        const alert = await prisma.inventoryAlert.create({
            data: {
                itemId,
                threshold: parseInt(threshold),
                isActive: true,
            },
            include: {
                item: true,
            },
        });

        res.status(201).json(alert);
    } catch (error) {
        console.error('Create inventory alert error:', error);
        res.status(500).json({ error: 'Failed to create inventory alert' });
    }
};

// Update alert
export const updateInventoryAlert = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { workspaceId } = req.user;
        const { threshold, isActive } = req.body;

        const existing = await prisma.inventoryAlert.findFirst({
            where: {
                id,
                item: { workspaceId },
            },
        });

        if (!existing) {
            return res.status(404).json({ error: 'Alert not found' });
        }

        const alert = await prisma.inventoryAlert.update({
            where: { id: id as string },
            data: {
                ...(threshold !== undefined && { threshold: parseInt(threshold) }),
                ...(isActive !== undefined && { isActive }),
            },
            include: {
                item: true,
            },
        });

        res.json(alert);
    } catch (error) {
        console.error('Update inventory alert error:', error);
        res.status(500).json({ error: 'Failed to update inventory alert' });
    }
};

// Delete alert
export const deleteInventoryAlert = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { workspaceId } = req.user;

        const existing = await prisma.inventoryAlert.findFirst({
            where: {
                id,
                item: { workspaceId },
            },
        });

        if (!existing) {
            return res.status(404).json({ error: 'Alert not found' });
        }

        await prisma.inventoryAlert.delete({
            where: { id: id as string },
        });

        res.json({ message: 'Alert deleted successfully' });
    } catch (error) {
        console.error('Delete inventory alert error:', error);
        res.status(500).json({ error: 'Failed to delete inventory alert' });
    }
};
