import { Router } from 'express';
import authRouter from './auth';
import usersRouter from './users';
import diseasesRouter from './diseases';
import medicationsRouter from './medications';
import adminRouter from './admin';
import profileRouter from './profile';
import doctorsRouter from '../doctors';
import appointmentsRouter from '../appointments';

const router = Router();

router.use('/auth', authRouter);
router.use('/user', usersRouter);
router.use('/diseases', diseasesRouter);
router.use('/medications', medicationsRouter);
router.use('/admin', adminRouter);
router.use('/profile', profileRouter);
router.use('/doctors', doctorsRouter);
router.use('/appointments', appointmentsRouter);

export default router;
