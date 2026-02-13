import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
    createFormTemplateSchema,
    updateFormTemplateSchema,
    submitFormSchema,
} from '../schemas/forms';
import {
    getFormTemplates,
    getFormTemplate,
    createFormTemplate,
    updateFormTemplate,
    deleteFormTemplate,
    duplicateFormTemplate,
} from '../controllers/formTemplateController';
import {
    getFormSubmissions,
    getSubmission,
    submitForm,
    updateSubmission,
    deleteSubmission,
} from '../controllers/formSubmissionController';

const router = Router();

router.use(authenticate as any);

// Form template routes
router.get('/templates', getFormTemplates as any);
router.post('/templates', validate(createFormTemplateSchema), createFormTemplate as any);
router.get('/templates/:id', getFormTemplate as any);
router.put('/templates/:id', validate(updateFormTemplateSchema), updateFormTemplate as any);
router.delete('/templates/:id', deleteFormTemplate as any);
router.post('/templates/:id/duplicate', duplicateFormTemplate as any);

// Form submission routes (for specific template)
router.get('/templates/:formId/submissions', getFormSubmissions as any);
router.post('/templates/:formId/submissions', validate(submitFormSchema), submitForm as any);

// Form submission routes (individual submissions)
router.get('/submissions/:id', getSubmission as any);
router.put('/submissions/:id', updateSubmission as any);
router.delete('/submissions/:id', deleteSubmission as any);

export default router;
