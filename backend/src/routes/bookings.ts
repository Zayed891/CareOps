import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createBookingSchema } from '../schemas/booking';
import {
    getBookings,
    getBooking,
    createBooking,
    updateBooking,
    updateBookingStatus,
    deleteBooking,
} from '../controllers/bookingController';

const router = Router();

router.use(authenticate as any);

router.get('/', getBookings as any);
router.post('/', validate(createBookingSchema), createBooking as any);
router.get('/:id', getBooking as any);
router.put('/:id', updateBooking as any);
router.patch('/:id/status', updateBookingStatus as any);
router.delete('/:id', deleteBooking as any);

export default router;
