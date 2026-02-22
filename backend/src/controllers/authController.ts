import { Request, Response } from 'express';
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  resetPassword,
  changePassword
} from '../services/authService';
import { logger } from '../lib/logger';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required' });
      return;
    }

    const result = await registerUser({ email, password, firstName, lastName });

    res.status(201).json({
      ...result,
      message: 'Registration successful. Please verify your email.'
    });
  } catch (error) {
    logger.error({ err: error }, 'Registration error');
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed'
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, rememberMe = false } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required' });
      return;
    }

    const result = await loginUser({
      email,
      password,
      rememberMe,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    const cookieMaxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: cookieMaxAge
    });

    res.status(200).json({
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      message: 'Login successful'
    });
  } catch (error) {
    logger.error({ err: error }, 'Login error');
    res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : 'Login failed'
    });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      res.status(401).json({ success: false, error: 'Refresh token required' });
      return;
    }

    const result = await refreshAccessToken(refreshToken);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    logger.error({ err: error }, 'Token refresh error');
    res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : 'Token refresh failed'
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (refreshToken) {
      await logoutUser(refreshToken);
    }

    res.clearCookie('refreshToken');
    res.status(200).json({ success: true, message: 'Logout successful' });
  } catch (error) {
    logger.error({ err: error }, 'Logout error');
    res.status(500).json({ success: false, error: 'Logout failed' });
  }
};

export const resetPasswordHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({ success: false, error: 'Token and new password are required' });
      return;
    }

    await resetPassword(token, password);
    res.status(200).json({
      success: true,
      message: 'Password reset successful. Please login with your new password.'
    });
  } catch (error) {
    logger.error({ err: error }, 'Password reset error');
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Password reset failed'
    });
  }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    res.status(200).json({ success: true, data: { user: req.user } });
  } catch (error) {
    logger.error({ err: error }, 'Get current user error');
    res.status(500).json({ success: false, error: 'Failed to get user info' });
  }
};

export const changePasswordHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      });
      return;
    }

    await changePassword(req.user.id, currentPassword, newPassword);
    res.clearCookie('refreshToken');

    res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please login again.'
    });
  } catch (error) {
    logger.error({ err: error }, 'Password change error');
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Password change failed'
    });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      res.status(400).json({ success: false, error: 'Email and code are required' });
      return;
    }

    const { verifyEmailWithCode } = await import('../services/authService');
    const result = await verifyEmailWithCode(email, code);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    logger.error({ err: error }, 'Email verification error');
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Email verification failed'
    });
  }
};

export const resendVerification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ success: false, error: 'Email is required' });
      return;
    }

    const { resendVerificationCode } = await import('../services/authService');
    const result = await resendVerificationCode(email);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    logger.error({ err: error }, 'Resend verification error');
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to resend verification code'
    });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ success: false, error: 'Email is required' });
      return;
    }

    const { requestPasswordResetWithOTP } = await import('../services/authService');
    const result = await requestPasswordResetWithOTP(email);

    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    logger.error({ err: error }, 'Forgot password error');
    res.status(500).json({ success: false, error: 'Failed to process password reset request' });
  }
};

export const resetPasswordWithCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      res.status(400).json({
        success: false,
        error: 'Email, code, and new password are required'
      });
      return;
    }

    const { resetPasswordWithOTP } = await import('../services/authService');
    const result = await resetPasswordWithOTP(email, code, newPassword);

    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    logger.error({ err: error }, 'Reset password error');
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Password reset failed'
    });
  }
};

export const getSessions = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const { getUserSessions } = await import('../services/authService');
    const sessions = await getUserSessions(req.user.id);

    const currentToken = req.cookies?.refreshToken;
    let currentSessionId: string | null = null;

    if (currentToken) {
      const { prisma } = await import('../lib/database');
      const currentSession = await prisma.refreshToken.findUnique({
        where: { token: currentToken },
        select: { id: true }
      });
      currentSessionId = currentSession?.id || null;
    }

    const sessionsWithCurrent = sessions.map(session => ({
      ...session,
      isCurrent: session.id === currentSessionId
    }));

    res.status(200).json({ success: true, data: { sessions: sessionsWithCurrent } });
  } catch (error) {
    logger.error({ err: error }, 'Get sessions error');
    res.status(500).json({ success: false, error: 'Failed to retrieve sessions' });
  }
};

export const revokeSession = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const { revokeSession: revokeSessionService } = await import('../services/authService');
    await revokeSessionService(req.user.id, id);

    res.status(200).json({ success: true, message: 'Session revoked successfully' });
  } catch (error) {
    logger.error({ err: error }, 'Revoke session error');
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to revoke session'
    });
  }
};

export const revokeAllOtherSessions = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const currentToken = req.cookies?.refreshToken;
    if (!currentToken) {
      res.status(400).json({ success: false, error: 'No active session found' });
      return;
    }

    const { prisma } = await import('../lib/database');
    const currentSession = await prisma.refreshToken.findUnique({
      where: { token: currentToken },
      select: { id: true }
    });

    if (!currentSession) {
      res.status(400).json({ success: false, error: 'Invalid session' });
      return;
    }

    const { revokeAllOtherSessions: revokeAllService } = await import('../services/authService');
    await revokeAllService(req.user.id, currentSession.id);

    res.status(200).json({ success: true, message: 'All other sessions revoked successfully' });
  } catch (error) {
    logger.error({ err: error }, 'Revoke all sessions error');
    res.status(500).json({ success: false, error: 'Failed to revoke sessions' });
  }
};
