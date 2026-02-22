import express from 'express';
import { authenticateToken } from '../../middleware/auth';
import { sanitizeInput } from '../../middleware/sanitization';
import * as profileController from '../../controllers/profileController';

const router = express.Router();

// All profile routes require authentication
router.use(authenticateToken);

// Apply sanitization to all PUT requests
router.use(sanitizeInput);

// Authenticated user's own profile
router.get('/', profileController.getOwnProfile);
router.put('/', profileController.updateOwnProfile);
router.put('/password', profileController.changePassword);

// Legacy routes with userId (for backward compatibility)
router.get('/:userId', profileController.getUserProfile);
router.put('/:userId', profileController.updateUserProfile);
router.get('/:userId/theme', profileController.getUserTheme);
router.put('/:userId/theme', profileController.updateUserTheme);

export default router;
