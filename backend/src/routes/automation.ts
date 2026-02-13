import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createAutomationRuleSchema, updateAutomationRuleSchema } from '../schemas/automation';
import {
    getAutomationRules,
    createAutomationRule,
    updateAutomationRule,
    deleteAutomationRule,
} from '../controllers/automationController';

const router = Router();

router.use(authenticate as any);

router.get('/', getAutomationRules as any);
router.post('/', validate(createAutomationRuleSchema), createAutomationRule as any);
router.put('/:id', validate(updateAutomationRuleSchema), updateAutomationRule as any);
router.delete('/:id', deleteAutomationRule as any);

export default router;
