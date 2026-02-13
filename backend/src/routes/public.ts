import { Router } from 'express';
import {
    getPublicBookingPage,
    getPublicAvailability,
    createPublicBooking,
    submitPublicContactForm,
    getPublicForm,
    submitPublicForm,
} from '../controllers/publicController';

const router = Router();

// No authentication required — these are customer-facing endpoints
router.get('/booking-page/:slug', getPublicBookingPage as any);
router.get('/booking-page/:slug/availability', getPublicAvailability as any);
router.post('/bookings', createPublicBooking as any);
router.post('/contact-form', submitPublicContactForm as any);
router.get('/forms/:id', getPublicForm as any);
router.post('/forms/:id/submit', submitPublicForm as any);

export default router;
