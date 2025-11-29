
import express from 'express';
import * as profileController from '../controllers/profileController';

const router = express.Router();

router.get('/:userId', profileController.getUserProfile);
router.put('/:userId', profileController.updateUserProfile);
router.get('/:userId/theme', profileController.getUserTheme);
router.put('/:userId/theme', profileController.updateUserTheme);

export default router;
