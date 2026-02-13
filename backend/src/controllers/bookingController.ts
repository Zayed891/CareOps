import { Response } from 'express';
import { AuthRequest } from './../types/express';
import prisma from '../db';
import automationEngine from '../services/automationEngine';

// Get all bookings for workspace
export const getBookings = async (req: AuthRequest, res: Response) => {
    try {
        const { workspaceId } = req.user;
        const {
            status,
            contactId,
            serviceTypeId,
            from,
            to,
            page = '1',
            limit = '10',
            sortBy = 'scheduledAt',
            sortOrder = 'desc'
        } = req.query;

        // Pagination
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {
            serviceType: {
                workspaceId,
            },
        };

        if (status) where.status = status;
        if (contactId) where.contactId = contactId as string;
        if (serviceTypeId) where.serviceTypeId = serviceTypeId as string;

        if (from || to) {
            where.scheduledAt = {};
            if (from) where.scheduledAt.gte = new Date(from as string);
            if (to) where.scheduledAt.lte = new Date(to as string);
        }

        // Parallel fetch for counts and data
        const [total, bookings] = await prisma.$transaction([
            prisma.booking.count({ where }),
            prisma.booking.findMany({
                where,
                include: {
                    contact: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                        },
                    },
                    serviceType: {
                        select: {
                            id: true,
                            name: true,
                            duration: true,
                            location: true,
                        },
                    },
                },
                orderBy: {
                    [sortBy as string]: sortOrder as 'asc' | 'desc',
                },
                take: limitNum,
                skip,
            })
        ]);

        res.json({
            data: bookings,
            meta: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
};

// Get single booking
export const getBooking = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { workspaceId } = req.user;

        const booking = await prisma.booking.findFirst({
            where: {
                id,
                serviceType: { workspaceId },
            },
            include: {
                contact: true,
                serviceType: true,
                formSubmissions: {
                    include: {
                        template: true,
                    },
                },
            },
        });

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        res.json(booking);
    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({ error: 'Failed to fetch booking' });
    }
};

// Create booking
export const createBooking = async (req: AuthRequest, res: Response) => {
    try {
        const { workspaceId } = req.user;
        const { contactId, serviceTypeId, scheduledAt, status } = req.body;

        // Validation
        if (!contactId || !serviceTypeId || !scheduledAt) {
            return res.status(400).json({
                error: 'Contact, service type, and scheduled time are required',
            });
        }

        // Verify service type belongs to workspace
        const serviceType = await prisma.serviceType.findFirst({
            where: { id: serviceTypeId, workspaceId },
        });

        if (!serviceType) {
            return res.status(404).json({ error: 'Service type not found' });
        }

        // Verify contact belongs to workspace
        const contact = await prisma.contact.findFirst({
            where: { id: contactId, workspaceId },
        });

        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        // Check for booking conflicts (same service type, overlapping time)
        const scheduledDate = new Date(scheduledAt);
        const endTime = new Date(scheduledDate.getTime() + serviceType.duration * 60000);

        const conflictingBooking = await prisma.booking.findFirst({
            where: {
                serviceTypeId,
                scheduledAt: {
                    gte: scheduledDate,
                    lt: endTime,
                },
                status: {
                    notIn: ['CANCELLED', 'NO_SHOW'],
                },
            },
        });

        if (conflictingBooking) {
            return res.status(409).json({
                error: 'Time slot is not available',
                conflictingBooking: conflictingBooking.id,
            });
        }

        const booking = await prisma.booking.create({
            data: {
                contactId,
                serviceTypeId,
                scheduledAt: new Date(scheduledAt),
                status: status || 'PENDING',
            },
            include: {
                contact: true,
                serviceType: true,
            },
        });

        res.status(201).json(booking);

        // Fire automation event (non-blocking)
        const contactWorkspaceId = booking.contact?.workspaceId;
        if (contactWorkspaceId) {
            automationEngine.emit('booking_created', contactWorkspaceId, {
                bookingId: booking.id,
                contactId: booking.contactId,
                email: booking.contact?.email,
                phone: booking.contact?.phone,
                serviceType: booking.serviceType?.name,
                scheduledAt: booking.scheduledAt,
            });

            // Auto-send linked forms
            const linkedForms = await prisma.formTemplate.findMany({
                where: { workspaceId: contactWorkspaceId, serviceTypeId },
            });
            if (linkedForms.length > 0) {
                for (const form of linkedForms) {
                    await prisma.formSubmission.create({
                        data: {
                            templateId: form.id,
                            contactId: booking.contactId,
                            bookingId: booking.id,
                            data: {},
                            status: 'PENDING',
                        },
                    });
                }
                automationEngine.emit('form_pending', contactWorkspaceId, {
                    contactId: booking.contactId,
                    email: booking.contact?.email,
                    phone: booking.contact?.phone,
                    bookingId: booking.id,
                    formCount: linkedForms.length,
                });
            }
        }
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({ error: 'Failed to create booking' });
    }
};

// Update booking
export const updateBooking = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { workspaceId } = req.user;
        const { scheduledAt, status } = req.body;

        // Check if booking exists and belongs to workspace
        const existing = await prisma.booking.findFirst({
            where: {
                id,
                serviceType: { workspaceId },
            },
            include: { serviceType: true },
        });

        if (!existing) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        const booking = await prisma.booking.update({
            where: { id: id as string },
            data: {
                ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
                ...(status && { status }),
            },
            include: {
                contact: true,
                serviceType: true,
            },
        });

        res.json(booking);
    } catch (error) {
        console.error('Update booking error:', error);
        res.status(500).json({ error: 'Failed to update booking' });
    }
};

// Update booking status
export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { workspaceId } = req.user;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        // Check if booking exists and belongs to workspace
        const existing = await prisma.booking.findFirst({
            where: {
                id,
                serviceType: { workspaceId },
            },
        });

        if (!existing) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        const booking = await prisma.booking.update({
            where: { id: id as string },
            data: { status },
            include: {
                contact: true,
                serviceType: true,
            },
        });

        res.json(booking);
    } catch (error) {
        console.error('Update booking status error:', error);
        res.status(500).json({ error: 'Failed to update booking status' });
    }
};

// Delete/cancel booking
export const deleteBooking = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { workspaceId } = req.user;

        // Check if booking exists and belongs to workspace
        const existing = await prisma.booking.findFirst({
            where: {
                id,
                serviceType: { workspaceId },
            },
        });

        if (!existing) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Soft delete: mark as cancelled instead of deleting
        const booking = await prisma.booking.update({
            where: { id: id as string },
            data: { status: 'CANCELLED' },
        });

        res.json({ message: 'Booking cancelled successfully', booking });
    } catch (error) {
        console.error('Delete booking error:', error);
        res.status(500).json({ error: 'Failed to cancel booking' });
    }
};
