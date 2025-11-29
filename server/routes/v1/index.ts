import { Router } from 'express';
import authRouter from './auth';
import usersRouter from './users';
import diseasesRouter from './diseases';
import medicationsRouter from './medications';
import adminRouter from './admin';
import profileRouter from './profile';

const router = Router();

// Mount v1 routes
router.use('/auth', authRouter);
router.use('/user', usersRouter);
router.use('/diseases', diseasesRouter);
router.use('/medications', medicationsRouter);
router.use('/admin', adminRouter);
router.use('/profile', profileRouter);

export default router;
