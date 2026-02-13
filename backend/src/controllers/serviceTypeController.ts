import { Response } from 'express';
import { AuthRequest } from '../types/express';
import prisma from '../db';

// Get all service types for workspace
export const getServiceTypes = async (req: AuthRequest, res: Response) => {
    try {
        const { workspaceId } = req.user;
        const {
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

        const [total, serviceTypes] = await prisma.$transaction([
            prisma.serviceType.count({ where }),
            prisma.serviceType.findMany({
                where,
                include: {
                    availabilities: true,
                },
                orderBy: { [sortBy as string]: sortOrder as 'asc' | 'desc' },
                take: limitNum,
                skip,
            })
        ]);

        res.json({
            data: serviceTypes,
            meta: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Get service types error:', error);
        res.status(500).json({ error: 'Failed to fetch service types' });
    }
};

// Get single service type
export const getServiceType = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { workspaceId } = req.user;

        const serviceType = await prisma.serviceType.findFirst({
            where: {
                id,
                workspaceId,
            },
        });

        if (!serviceType) {
            return res.status(404).json({ error: 'Service type not found' });
        }

        res.json(serviceType);
    } catch (error) {
        console.error('Get service type error:', error);
        res.status(500).json({ error: 'Failed to fetch service type' });
    }
};

// Create service type
export const createServiceType = async (req: AuthRequest, res: Response) => {
    try {
        const { workspaceId } = req.user;
        const { name, description, duration, location } = req.body;

        // Validation
        if (!name || !duration) {
            return res.status(400).json({ error: 'Name and duration are required' });
        }

        const serviceType = await prisma.serviceType.create({
            data: {
                workspaceId,
                name,
                description,
                duration: parseInt(duration),
                location,
            },
        });

        res.status(201).json(serviceType);
    } catch (error) {
        console.error('Create service type error:', error);
        res.status(500).json({ error: 'Failed to create service type' });
    }
};

// Update service type
export const updateServiceType = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { workspaceId } = req.user;
        const { name, description, duration, location } = req.body;

        // Check if service type exists and belongs to workspace
        const existing = await prisma.serviceType.findFirst({
            where: { id: id as string, workspaceId },
        });

        if (!existing) {
            return res.status(404).json({ error: 'Service type not found' });
        }

        const serviceType = await prisma.serviceType.update({
            where: { id: id as string },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(duration && { duration: parseInt(duration) }),
                ...(location !== undefined && { location }),
            },
        });

        res.json(serviceType);
    } catch (error) {
        console.error('Update service type error:', error);
        res.status(500).json({ error: 'Failed to update service type' });
    }
};

// Delete service type
export const deleteServiceType = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { workspaceId } = req.user;

        // Check if service type exists and belongs to workspace
        const existing = await prisma.serviceType.findFirst({
            where: { id: id as string, workspaceId },
        });

        if (!existing) {
            return res.status(404).json({ error: 'Service type not found' });
        }

        // Check if there are bookings using this service type
        const bookingsCount = await prisma.booking.count({
            where: { serviceTypeId: id as string },
        });

        if (bookingsCount > 0) {
            return res.status(400).json({
                error: 'Cannot delete service type with existing bookings. Consider marking it as inactive instead.',
            });
        }

        await prisma.serviceType.delete({
            where: { id: id as string },
        });

        res.json({ message: 'Service type deleted successfully' });
    } catch (error) {
        console.error('Delete service type error:', error);
        res.status(500).json({ error: 'Failed to delete service type' });
    }
};
