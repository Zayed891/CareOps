import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createServiceTypeSchema } from '../schemas/booking';
import {
    getServiceTypes,
    getServiceType,
    createServiceType,
    updateServiceType,
    deleteServiceType,
} from '../controllers/serviceTypeController';

const router = Router();

// All routes require authentication
router.use(authenticate as any);

// Service type routes
router.get('/', getServiceTypes as any);
router.post('/', validate(createServiceTypeSchema), createServiceType as any);
router.get('/:id', getServiceType as any);
router.put('/:id', updateServiceType as any);
router.delete('/:id', deleteServiceType as any);

export default router;
