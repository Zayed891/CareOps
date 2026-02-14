import { Response } from 'express';
import { AuthRequest } from './../types/express';
import prisma from '../db';
import automationEngine from '../services/automationEngine';

// Get all inventory items
export const getInventoryItems = async (req: AuthRequest, res: Response) => {
    try {
        const { workspaceId } = req.user;
        const {
            lowStock,
            page = '1',
            limit = '10',
            sortBy = 'name',
            sortOrder = 'asc'
        } = req.query;

        // Pagination
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const where: any = { workspaceId };

        // Handle low stock filter differently since it might need computation
        // But if we use the threshold in the DB we can query it directly
        // The current lowStock logic was filtering in memory. Let's keep it consistent for now
        // BUT pagination + in-memory filtering is broken. We should try to push filtering to DB.

        // However, lowStock check involves checking quantity <= reorderLevel OR alert threshold
        // Prisma doesn't easily support "quantity <= otherField" in where clause without raw query or relation filtering
        // For now, let's just paginate the results. If lowStock is true, we might need to filter first?
        // Actually, if lowStock is enabled, we probably want ALL low stock items, maybe paginated?
        // Given complexity, let's paginate the main list query first.

        let items;
        let total;

        if (lowStock === 'true') {
            // Fetch all for in-memory filtering (not ideal for large datasets but works for now)
            const allItems = await prisma.inventoryItem.findMany({
                where,
                include: {
                    alerts: { where: { isActive: true } },
                },
                orderBy: { [sortBy as string]: sortOrder as 'asc' | 'desc' },
            });

            const lowStockItems = allItems.filter((item: any) => {
                const threshold = item.alerts[0]?.threshold || item.reorderLevel;
                return threshold && item.quantity <= threshold;
            });

            total = lowStockItems.length;
            const startIndex = (pageNum - 1) * limitNum;
            items = lowStockItems.slice(startIndex, startIndex + limitNum);
        } else {
            // Standard db pagination
            [total, items] = await prisma.$transaction([
                prisma.inventoryItem.count({ where }),
                prisma.inventoryItem.findMany({
                    where,
                    include: {
                        alerts: { where: { isActive: true } },
                    },
                    orderBy: { [sortBy as string]: sortOrder as 'asc' | 'desc' },
                    take: limitNum,
                    skip,
                })
            ]);
        }

        res.json({
            data: items,
            meta: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Get inventory items error:', error);
        res.status(500).json({ error: 'Failed to fetch inventory items' });
    }
};

// Get single inventory item
export const getInventoryItem = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { workspaceId } = req.user;

        const item = await prisma.inventoryItem.findFirst({
            where: { id: id as string, workspaceId },
            include: {
                alerts: true,
            },
        });

        if (!item) {
            return res.status(404).json({ error: 'Inventory item not found' });
        }

        res.json(item);
    } catch (error) {
        console.error('Get inventory item error:', error);
        res.status(500).json({ error: 'Failed to fetch inventory item' });
    }
};

// Create inventory item
export const createInventoryItem = async (req: AuthRequest, res: Response) => {
    try {
        const { workspaceId } = req.user;
        const { name, description, quantity, unit, reorderLevel, category } = req.body;

        if (!name || !unit) {
            return res.status(400).json({ error: 'Name and unit are required' });
        }

        const item = await prisma.inventoryItem.create({
            data: {
                workspaceId,
                name,
                description,
                quantity: quantity ? parseInt(quantity) : 0,
                unit,
                reorderLevel: reorderLevel ? parseInt(reorderLevel) : null,
                category,
            },
        });

        // Create default alert if reorder level is set
        if (reorderLevel) {
            await prisma.inventoryAlert.create({
                data: {
                    itemId: item.id,
                    threshold: parseInt(reorderLevel),
                    isActive: true,
                },
            });
        }

        res.status(201).json(item);
    } catch (error) {
        console.error('Create inventory item error:', error);
        res.status(500).json({ error: 'Failed to create inventory item' });
    }
};

// Update inventory item
export const updateInventoryItem = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { workspaceId } = req.user;
        const { name, description, quantity, unit, reorderLevel, category } = req.body;

        const existing = await prisma.inventoryItem.findFirst({
            where: { id: id as string, workspaceId },
        });

        if (!existing) {
            return res.status(404).json({ error: 'Inventory item not found' });
        }

        const item = await prisma.inventoryItem.update({
            where: { id: id as string },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(quantity !== undefined && { quantity: parseInt(quantity) }),
                ...(unit && { unit }),
                ...(reorderLevel !== undefined && {
                    reorderLevel: reorderLevel ? parseInt(reorderLevel) : null,
                }),
                ...(category !== undefined && { category }),
            },
        });

        res.json(item);
    } catch (error) {
        console.error('Update inventory item error:', error);
        res.status(500).json({ error: 'Failed to update inventory item' });
    }
};

// Update stock quantity
export const updateStock = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { workspaceId } = req.user;
        const { quantity, adjustment } = req.body;

        const existing = await prisma.inventoryItem.findFirst({
            where: { id: id as string, workspaceId },
        });

        if (!existing) {
            return res.status(404).json({ error: 'Inventory item not found' });
        }

        let newQuantity: number;

        if (quantity !== undefined) {
            // Set absolute quantity
            newQuantity = parseInt(quantity);
        } else if (adjustment !== undefined) {
            // Adjust by amount (positive or negative)
            newQuantity = existing.quantity + parseInt(adjustment);
        } else {
            return res.status(400).json({
                error: 'Either quantity or adjustment must be provided',
            });
        }

        if (newQuantity < 0) {
            return res.status(400).json({ error: 'Quantity cannot be negative' });
        }

        const item = await prisma.inventoryItem.update({
            where: { id: id as string },
            data: { quantity: newQuantity },
            include: {
                alerts: {
                    where: { isActive: true },
                },
            },
        });

        // Check if we should trigger low stock alert
        const alert = item.alerts[0];
        if (alert && newQuantity <= alert.threshold) {
            // Update alert notification timestamp
            await prisma.inventoryAlert.update({
                where: { id: alert.id },
                data: { notifiedAt: new Date() },
            });

            // Emit automation event for low inventory
            const { workspaceId } = req.user;
            automationEngine.emit('inventory_low', workspaceId, {
                itemId: item.id,
                itemName: item.name,
                quantity: newQuantity,
                threshold: alert.threshold,
            });
        }

        res.json(item);
    } catch (error) {
        console.error('Update stock error:', error);
        res.status(500).json({ error: 'Failed to update stock' });
    }
};

// Delete inventory item
export const deleteInventoryItem = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { workspaceId } = req.user;

        const existing = await prisma.inventoryItem.findFirst({
            where: { id: id as string, workspaceId },
        });

        if (!existing) {
            return res.status(404).json({ error: 'Inventory item not found' });
        }

        // Delete associated alerts first
        await prisma.inventoryAlert.deleteMany({
            where: { itemId: id },
        });

        await prisma.inventoryItem.delete({
            where: { id: id as string },
        });

        res.json({ message: 'Inventory item deleted successfully' });
    } catch (error) {
        console.error('Delete inventory item error:', error);
        res.status(500).json({ error: 'Failed to delete inventory item' });
    }
};
