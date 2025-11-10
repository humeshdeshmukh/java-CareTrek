import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Add a new health metric
router.post('/', HealthController.addMetric);

// Get health metrics with optional filters
router.get('/', HealthController.getMetrics);

// Get health summary for dashboard
router.get('/summary', HealthController.getSummary);

// Update a health metric
router.put('/:id', HealthController.updateMetric);

// Delete a health metric
router.delete('/:id', HealthController.deleteMetric);

// Get metrics for a family member (requires permission)
router.get('/family/:seniorId', HealthController.getFamilyMemberMetrics);

// Get summary for a family member (requires permission)
router.get('/family/:seniorId/summary', HealthController.getFamilyMemberSummary);

export default router;
