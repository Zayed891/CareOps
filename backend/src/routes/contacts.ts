import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createContactSchema, updateContactSchema } from '../schemas/contact';
import {
    getContacts,
    getContact,
    createContact,
    updateContact,
    deleteContact,
} from '../controllers/contactController';

const router = Router();

router.use(authenticate as any);

router.get('/', getContacts as any);
router.post('/', validate(createContactSchema), createContact as any);
router.get('/:id', getContact as any);
router.put('/:id', validate(updateContactSchema), updateContact as any);
router.delete('/:id', deleteContact as any);

export default router;
