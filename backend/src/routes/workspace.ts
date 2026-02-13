import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { activateWorkspace, getWorkspaceStatus, updateWorkspace, getWorkspace } from '../controllers/workspaceController';

const router = Router();

router.use(authenticate as any);

router.get('/', getWorkspace as any);
router.put('/', updateWorkspace as any);
router.get('/status', getWorkspaceStatus as any);
router.post('/activate', activateWorkspace as any);

export default router;
