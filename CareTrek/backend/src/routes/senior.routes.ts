import { Router } from 'express';
import { SeniorController } from '../controllers/senior.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get senior health data
router.get('/:seniorId/health', SeniorController.getHealthData);

// Get senior medications
router.get('/:seniorId/medications', SeniorController.getMedications);

// Get senior appointments
router.get('/:seniorId/appointments', SeniorController.getAppointments);

// Get senior location
router.get('/:seniorId/location', SeniorController.getLocation);

// Get senior activity feed
router.get('/:seniorId/activity', SeniorController.getActivityFeed);

// Get senior profile
router.get('/:seniorId/profile', SeniorController.getProfile);

export default router;
