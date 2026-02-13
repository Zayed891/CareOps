import { Response } from 'express';
import { AuthRequest } from '../types/express';
import prisma from '../db';

// Get availability slots
export const getAvailability = async (req: AuthRequest, res: Response) => {
    try {
        const serviceTypeId = req.query.serviceTypeId as string | undefined;
        const dayOfWeek = req.query.dayOfWeek ? parseInt(req.query.dayOfWeek as string) : undefined;

        const where: any = {};
        if (serviceTypeId) where.serviceTypeId = serviceTypeId;
        if (dayOfWeek !== undefined) where.dayOfWeek = dayOfWeek;

        const availability = await prisma.availability.findMany({
            where,
            include: {
                serviceType: {
                    select: {
                        id: true,
                        name: true,
                        workspaceId: true,
                    },
                },
            },
            orderBy: [
                { dayOfWeek: 'asc' },
                { startTime: 'asc' },
            ],
        });

        // Filter by workspace
        const filtered = availability.filter(
            (a) => a.serviceType.workspaceId === req.user.workspaceId
        );

        res.json(filtered);
    } catch (error) {
        console.error('Get availability error:', error);
        res.status(500).json({ error: 'Failed to fetch availability' });
    }
};

// Create availability slot
export const createAvailability = async (req: AuthRequest, res: Response) => {
    try {
        const { workspaceId } = req.user;
        const { serviceTypeId, dayOfWeek, startTime, endTime } = req.body;

        // Validation
        if (!serviceTypeId || dayOfWeek === undefined || !startTime || !endTime) {
            return res.status(400).json({
                error: 'Service type, day of week, start time, and end time are required',
            });
        }

        // Verify service type belongs to workspace
        const serviceType = await prisma.serviceType.findFirst({
            where: { id: serviceTypeId, workspaceId },
        });

        if (!serviceType) {
            return res.status(404).json({ error: 'Service type not found' });
        }

        // Validate day of week (0-6)
        if (dayOfWeek < 0 || dayOfWeek > 6) {
            return res.status(400).json({ error: 'Day of week must be between 0 and 6' });
        }

        const availability = await prisma.availability.create({
            data: {
                serviceTypeId,
                dayOfWeek: parseInt(dayOfWeek),
                startTime,
                endTime,
            },
            include: {
                serviceType: true,
            },
        });

        res.status(201).json(availability);
    } catch (error) {
        console.error('Create availability error:', error);
        res.status(500).json({ error: 'Failed to create availability' });
    }
};

// Update availability
export const updateAvailability = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { workspaceId } = req.user;
        const { dayOfWeek, startTime, endTime } = req.body;

        // Check if availability exists and belongs to workspace
        const existing = await prisma.availability.findFirst({
            where: { id: id as string },
            include: { serviceType: true },
        });

        if (!existing || existing.serviceType.workspaceId !== workspaceId) {
            return res.status(404).json({ error: 'Availability not found' });
        }

        const availability = await prisma.availability.update({
            where: { id: id as string },
            data: {
                ...(dayOfWeek !== undefined && { dayOfWeek: parseInt(dayOfWeek) }),
                ...(startTime && { startTime }),
                ...(endTime && { endTime }),
            },
            include: {
                serviceType: true,
            },
        });

        res.json(availability);
    } catch (error) {
        console.error('Update availability error:', error);
        res.status(500).json({ error: 'Failed to update availability' });
    }
};

// Delete availability
export const deleteAvailability = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { workspaceId } = req.user;

        // Check if availability exists and belongs to workspace
        const existing = await prisma.availability.findFirst({
            where: { id: id as string },
            include: { serviceType: true },
        });

        if (!existing || existing.serviceType.workspaceId !== workspaceId) {
            return res.status(404).json({ error: 'Availability not found' });
        }

        await prisma.availability.delete({
            where: { id: id as string },
        });

        res.json({ message: 'Availability deleted successfully' });
    } catch (error) {
        console.error('Delete availability error:', error);
        res.status(500).json({ error: 'Failed to delete availability' });
    }
};
