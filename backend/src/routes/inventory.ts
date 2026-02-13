import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
    createInventoryItemSchema,
    updateInventoryItemSchema,
    updateStockSchema,
    createAlertSchema,
} from '../schemas/inventory';
import {
    getInventoryItems,
    getInventoryItem,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    updateStock,
} from '../controllers/inventoryController';
import {
    getInventoryAlerts,
    createInventoryAlert,
    updateInventoryAlert,
    deleteInventoryAlert,
} from '../controllers/inventoryAlertController';

const router = Router();

router.use(authenticate as any);

// Inventory item routes
router.get('/items', getInventoryItems as any);
router.post('/items', validate(createInventoryItemSchema), createInventoryItem as any);
router.get('/items/:id', getInventoryItem as any);
router.put('/items/:id', validate(updateInventoryItemSchema), updateInventoryItem as any);
router.delete('/items/:id', deleteInventoryItem as any);
router.post('/items/:id/stock', validate(updateStockSchema), updateStock as any);

// Inventory alert routes
router.get('/alerts', getInventoryAlerts as any);
router.post('/alerts', validate(createAlertSchema), createInventoryAlert as any);
router.put('/alerts/:id', updateInventoryAlert as any);
router.delete('/alerts/:id', deleteInventoryAlert as any);

export default router;
