import { Router } from 'express';
import { authenticateToken, checkOwnership } from '../middleware/auth';
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment
} from '../controllers/appointment.controller';

const router = Router();

// Protected routes (require authentication)
router.use(authenticateToken);

// GET /api/appointments - Get all appointments for the authenticated user
router.get('/', getAppointments);

// POST /api/appointments - Create a new appointment
router.post('/', createAppointment);

// PATCH /api/appointments/:id - Update an appointment
router.patch('/:id', updateAppointment);

// DELETE /api/appointments/:id - Delete an appointment
router.delete('/:id', deleteAppointment);

export default router;
