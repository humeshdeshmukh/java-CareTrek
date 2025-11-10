import { Router } from 'express';
import { FamilyController } from '../controllers/family.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Send connection request
router.post('/requests', FamilyController.sendRequest);

// Get connection requests (both sent and received)
router.get('/requests', FamilyController.getConnectionRequests);

// Respond to connection request
router.put('/requests/:connectionId', FamilyController.respondToRequest);

// Get all connected seniors for the current user
router.get('/seniors', FamilyController.getConnectedSeniors);

// Get all family members for a senior
router.get('/seniors/:seniorId/family-members', FamilyController.getFamilyMembers);

// Update connection permissions
router.put('/connections/:connectionId/permissions', FamilyController.updatePermissions);

// Remove a connection
router.delete('/connections/:connectionId', FamilyController.removeConnection);

// Check connection status with a senior
router.get('/check-connection/:seniorId', FamilyController.checkConnection);

export default router;
