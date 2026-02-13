import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
    getAvailability,
    createAvailability,
    updateAvailability,
    deleteAvailability,
} from '../controllers/availabilityController';

const router = Router();

// All routes require authentication
router.use(authenticate as any);

router.get('/', getAvailability as any);
router.post('/', createAvailability as any);
router.put('/:id', updateAvailability as any);
router.delete('/:id', deleteAvailability as any);

export default router;
