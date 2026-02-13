import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { inviteStaffSchema, updatePermissionsSchema } from '../schemas/staff';
import {
    getStaff,
    inviteStaff,
    updatePermissions,
    removeStaff,
} from '../controllers/staffController';

const router = Router();

router.use(authenticate as any);

router.get('/', getStaff as any);
router.post('/invite', validate(inviteStaffSchema), inviteStaff as any);
router.put('/:id/permissions', validate(updatePermissionsSchema), updatePermissions as any);
router.delete('/:id', removeStaff as any);

export default router;
