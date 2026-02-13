import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createIntegrationSchema, updateIntegrationSchema } from '../schemas/integration';
import {
    getIntegrations,
    createIntegration,
    updateIntegration,
    deleteIntegration,
} from '../controllers/integrationController';

const router = Router();

router.use(authenticate as any);

router.get('/', getIntegrations as any);
router.post('/', validate(createIntegrationSchema), createIntegration as any);
router.put('/:id', validate(updateIntegrationSchema), updateIntegration as any);
router.delete('/:id', deleteIntegration as any);

export default router;
