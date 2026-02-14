import { Request, Response } from 'express';
import prisma from '../db';
import automationEngine from '../services/automationEngine';
import { getIO } from '../services/socketService';

// GET /api/public/booking-page/:slug — Public booking page data
export const getPublicBookingPage = async (req: Request, res: Response) => {
    try {
        const slug = String(req.params.slug);
        const workspace = await prisma.workspace.findUnique({
            where: { slug },
            select: {
                id: true, name: true, address: true, timezone: true, isActive: true,
                serviceTypes: {
                    select: {
                        id: true, name: true, description: true, duration: true, location: true,
                        availabilities: true,
                    },
                },
            },
        });

        if (!workspace || !workspace.isActive) {
            return res.status(404).json({ error: 'Booking page not found' });
        }

        res.json(workspace);
    } catch (error) {
        console.error('Error fetching public booking page:', error);
        res.status(500).json({ error: 'Failed to load booking page' });
    }
};

// GET /api/public/booking-page/:slug/availability — Get real availability slots
export const getPublicAvailability = async (req: Request, res: Response) => {
    try {
        const slug = String(req.params.slug);
        const serviceTypeId = req.query.serviceTypeId as string;
        const date = req.query.date as string; // YYYY-MM-DD

        if (!serviceTypeId || !date) {
            return res.status(400).json({ error: 'serviceTypeId and date are required' });
        }

        const workspace = await prisma.workspace.findUnique({ where: { slug } });
        if (!workspace || !workspace.isActive) {
            return res.status(404).json({ error: 'Workspace not found' });
        }

        // Get the day of week (0 = Sunday, 6 = Saturday)
        const requestedDate = new Date(date);
        const dayOfWeek = requestedDate.getDay();

        // Get availability for this service type on this day
        const availabilities = await prisma.availability.findMany({
            where: {
                serviceTypeId,
                dayOfWeek,
                serviceType: { workspaceId: workspace.id },
            },
            orderBy: { startTime: 'asc' },
        });

        // Get the service type to know duration
        const serviceType = await prisma.serviceType.findFirst({
            where: { id: serviceTypeId, workspaceId: workspace.id },
        });

        if (!serviceType) {
            return res.status(404).json({ error: 'Service type not found' });
        }

        // Get existing bookings for that date to exclude taken slots
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const existingBookings = await prisma.booking.findMany({
            where: {
                serviceTypeId,
                scheduledAt: { gte: startOfDay, lte: endOfDay },
                status: { notIn: ['CANCELLED', 'NO_SHOW'] },
            },
        });

        const bookedTimes = new Set(
            existingBookings.map(b => {
                const d = new Date(b.scheduledAt);
                return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
            })
        );

        // Generate time slots from availability windows
        const slots: string[] = [];
        for (const avail of availabilities) {
            const [startH, startM] = avail.startTime.split(':').map(Number);
            const [endH, endM] = avail.endTime.split(':').map(Number);
            const startMinutes = startH * 60 + startM;
            const endMinutes = endH * 60 + endM;
            const duration = serviceType.duration;

            for (let m = startMinutes; m + duration <= endMinutes; m += duration) {
                const h = Math.floor(m / 60);
                const min = m % 60;
                const timeStr = `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
                if (!bookedTimes.has(timeStr)) {
                    slots.push(timeStr);
                }
            }
        }

        res.json({ slots, duration: serviceType.duration });
    } catch (error) {
        console.error('Error fetching public availability:', error);
        res.status(500).json({ error: 'Failed to fetch availability' });
    }
};

// POST /api/public/bookings — Customer creates a booking (no auth)
export const createPublicBooking = async (req: Request, res: Response) => {
    try {
        const { workspaceSlug, serviceTypeId, scheduledAt, name, email, phone } = req.body;

        const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
        if (!workspace || !workspace.isActive) {
            return res.status(404).json({ error: 'Workspace not found or inactive' });
        }

        const serviceType = await prisma.serviceType.findFirst({
            where: { id: serviceTypeId, workspaceId: workspace.id },
        });
        if (!serviceType) return res.status(404).json({ error: 'Service type not found' });

        // Find or create contact
        let contact = email
            ? await prisma.contact.findFirst({ where: { email, workspaceId: workspace.id } })
            : null;

        const isNewContact = !contact;

        if (!contact) {
            contact = await prisma.contact.create({
                data: { name, email, phone, workspaceId: workspace.id },
            });
            // Auto-create conversation
            await prisma.conversation.create({ data: { contactId: contact.id } });
        }

        // Create booking
        const booking = await prisma.booking.create({
            data: {
                contactId: contact.id,
                serviceTypeId,
                scheduledAt: new Date(scheduledAt),
                status: 'PENDING',
            },
            include: { serviceType: true },
        });

        res.status(201).json({ booking, message: 'Booking created successfully' });

        // Real-time notification
        try {
            const io = getIO();
            io.to(workspace.id).emit('booking:created', {
                bookingId: booking.id,
                contactName: contact.name,
                serviceTypeName: serviceType.name,
                scheduledAt: booking.scheduledAt,
            });
        } catch (err) {
            console.error('Socket emit error:', err);
        }

        // ── Fire automation events (non-blocking) ──
        if (isNewContact) {
            automationEngine.emit('contact_created', workspace.id, {
                contactId: contact.id,
                name: contact.name,
                email: contact.email,
                phone: contact.phone,
            });
        }

        automationEngine.emit('booking_created', workspace.id, {
            bookingId: booking.id,
            contactId: contact.id,
            email: contact.email,
            phone: contact.phone,
            serviceType: serviceType.name,
            scheduledAt: booking.scheduledAt,
        });

        // Auto-send linked forms
        const linkedForms = await prisma.formTemplate.findMany({
            where: { workspaceId: workspace.id, serviceTypeId },
        });
        if (linkedForms.length > 0 && contact.email) {
            for (const form of linkedForms) {
                // Create a pending form submission
                await prisma.formSubmission.create({
                    data: {
                        templateId: form.id,
                        contactId: contact.id,
                        bookingId: booking.id,
                        data: {},
                        status: 'PENDING',
                    },
                });
            }

            automationEngine.emit('form_pending', workspace.id, {
                contactId: contact.id,
                email: contact.email,
                phone: contact.phone,
                bookingId: booking.id,
                formCount: linkedForms.length,
            });
        }
    } catch (error) {
        console.error('Error creating public booking:', error);
        res.status(500).json({ error: 'Failed to create booking' });
    }
};

// POST /api/public/contact-form — Customer submits contact form (no auth)
export const submitPublicContactForm = async (req: Request, res: Response) => {
    try {
        const { workspaceSlug, name, email, phone, message } = req.body;

        const workspace = await prisma.workspace.findUnique({ where: { slug: workspaceSlug } });
        if (!workspace || !workspace.isActive) {
            return res.status(404).json({ error: 'Workspace not found or inactive' });
        }

        // Find or create contact
        let contact = email
            ? await prisma.contact.findFirst({ where: { email, workspaceId: workspace.id } })
            : null;

        const isNewContact = !contact;

        if (!contact) {
            contact = await prisma.contact.create({
                data: { name, email, phone, workspaceId: workspace.id },
            });
        }

        // Get or create conversation
        let conversation = await prisma.conversation.findFirst({
            where: { contactId: contact.id },
        });
        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: { contactId: contact.id },
            });
        }

        // Add message if provided
        if (message) {
            await prisma.message.create({
                data: {
                    conversationId: conversation.id,
                    content: message,
                    channel: 'EMAIL',
                    direction: 'INBOUND',
                },
            });
            await prisma.conversation.update({
                where: { id: conversation.id },
                data: { updatedAt: new Date() },
            });
        }

        res.status(201).json({ contact, message: 'Contact form submitted successfully' });

        // Real-time notification if message was added
        if (message) {
            try {
                const io = getIO();
                io.to(workspace.id).emit('message:received', {
                    conversationId: conversation.id,
                    contactName: contact.name,
                    content: message,
                    channel: 'EMAIL',
                    timestamp: new Date(),
                });
            } catch (err) {
                console.error('Socket emit error:', err);
            }
        }

        // ── Fire automation event (non-blocking) ──
        if (isNewContact) {
            automationEngine.emit('contact_created', workspace.id, {
                contactId: contact.id,
                name: contact.name,
                email: contact.email,
                phone: contact.phone,
            });
        }
    } catch (error) {
        console.error('Error submitting contact form:', error);
        res.status(500).json({ error: 'Failed to submit contact form' });
    }
};

// GET /api/public/forms/:id — Get public form (no auth)
export const getPublicForm = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id);
        const template = await prisma.formTemplate.findUnique({
            where: { id },
            include: { fields: { orderBy: { order: 'asc' } } },
        });

        if (!template) return res.status(404).json({ error: 'Form not found' });
        res.json(template);
    } catch (error) {
        console.error('Error fetching public form:', error);
        res.status(500).json({ error: 'Failed to load form' });
    }
};

// POST /api/public/forms/:id/submit — Submit public form (no auth)
export const submitPublicForm = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id);
        const { name, email, phone, message, data, bookingId } = req.body;

        const template = await prisma.formTemplate.findUnique({
            where: { id },
            include: { workspace: true },
        });
        if (!template) return res.status(404).json({ error: 'Form not found' });

        // Find or create contact
        let contact = email
            ? await prisma.contact.findFirst({ where: { email, workspaceId: template.workspaceId } })
            : null;

        const isNewContact = !contact;

        if (!contact) {
            // Create new contact
            contact = await prisma.contact.create({
                data: { name: name || 'Unknown', email, phone, workspaceId: template.workspaceId },
            });
        } else {
            // Update existing contact with latest information
            contact = await prisma.contact.update({
                where: { id: contact.id },
                data: {
                    ...(name && { name }), // Update name if provided
                    ...(phone && { phone }), // Update phone if provided
                },
            });
        }

        // If customer sent a message, add it to conversation
        if (message && message.trim()) {
            let conversation = await prisma.conversation.findFirst({
                where: { contactId: contact.id },
            });
            if (!conversation) {
                conversation = await prisma.conversation.create({
                    data: { contactId: contact.id },
                });
            }

            // Add customer's message to inbox
            await prisma.message.create({
                data: {
                    conversationId: conversation.id,
                    content: message,
                    channel: 'EMAIL',
                    direction: 'INBOUND',
                },
            });
            await prisma.conversation.update({
                where: { id: conversation.id },
                data: { updatedAt: new Date() },
            });

            // Real-time notification
            try {
                const io = getIO();
                io.to(template.workspaceId).emit('message:received', {
                    conversationId: conversation.id,
                    contactName: contact.name,
                    content: message,
                    channel: 'EMAIL',
                    timestamp: new Date(),
                });
            } catch (err) {
                console.error('Socket emit error:', err);
            }
        }

        // Check if there's an existing pending submission for this form + contact + booking
        if (bookingId) {
            const existingSubmission = await prisma.formSubmission.findFirst({
                where: { templateId: template.id, contactId: contact.id, bookingId, status: 'PENDING' },
            });
            if (existingSubmission) {
                // Update the existing submission
                const updated = await prisma.formSubmission.update({
                    where: { id: existingSubmission.id },
                    data: { data: data || {}, status: 'COMPLETED' },
                });
                return res.status(200).json({ submission: updated, message: 'Form submitted successfully' });
            }
        }

        const submission = await prisma.formSubmission.create({
            data: {
                templateId: template.id,
                contactId: contact.id,
                bookingId: bookingId || null,
                data: data || {},
                status: 'COMPLETED',
            },
        });

        res.status(201).json({ submission, message: 'Form submitted successfully' });

        // ── Fire automation event (non-blocking) ──
        if (isNewContact) {
            automationEngine.emit('contact_created', template.workspaceId, {
                contactId: contact.id,
                name: contact.name,
                email: contact.email,
                phone: contact.phone,
            });
        }
    } catch (error) {
        console.error('Error submitting public form:', error);
        res.status(500).json({ error: 'Failed to submit form' });
    }
};
