import { Router } from 'express';
import {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPasswordHandler,
  verifyEmail,
  resendVerification,
  getCurrentUser,
  changePasswordHandler,
  resetPasswordWithCode,
  getSessions,
  revokeSession,
  revokeAllOtherSessions
} from '../../controllers/authController';
import { authenticateToken } from '../../middleware/auth';
import { authLimiter } from '../../middleware/rateLimit';

const router = Router();

// Public
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', authLimiter, refresh);
router.post('/logout', logout);

// Email verification
router.post('/verify-email', authLimiter, verifyEmail);
router.post('/resend-verification', authLimiter, resendVerification);

// Password reset
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordWithCode);

// Protected
router.get('/me', authenticateToken, getCurrentUser);
router.put('/change-password', authenticateToken, changePasswordHandler);

// Sessions
router.get('/sessions', authenticateToken, getSessions);
router.delete('/sessions/:id', authenticateToken, revokeSession);
router.post('/sessions/revoke-all', authenticateToken, revokeAllOtherSessions);

export default router;
