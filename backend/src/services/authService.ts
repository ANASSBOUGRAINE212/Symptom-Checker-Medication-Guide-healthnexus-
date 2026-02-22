// @ts-nocheck
import { prisma } from '../lib/database';
import { hashPassword, verifyPassword, validatePasswordStrength } from '../lib/password';
import { generateAccessToken, generateRefreshToken, generateRandomToken, verifyRefreshToken } from '../lib/jwt';
import { logger } from '../lib/logger';

const parseDeviceName = (userAgent?: string): string => {
    if (!userAgent) return 'Unknown Device';

    if (/mobile/i.test(userAgent)) {
        if (/iphone/i.test(userAgent)) return 'iPhone';
        if (/ipad/i.test(userAgent)) return 'iPad';
        if (/android/i.test(userAgent)) return 'Android Phone';
        return 'Mobile Device';
    }

    if (/windows/i.test(userAgent)) return 'Windows PC';
    if (/macintosh|mac os x/i.test(userAgent)) return 'Mac';
    if (/linux/i.test(userAgent)) return 'Linux PC';

    return 'Desktop';
};

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000;
const REFRESH_TOKEN_EXPIRY_DAYS = 7;
const REFRESH_TOKEN_EXPIRY_DAYS_REMEMBER_ME = 30;
const REFRESH_TOKEN_EXPIRY_HOURS_NO_REMEMBER = 24;
const RESET_TOKEN_EXPIRY_HOURS = 1;
const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;

export interface RegisterData {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
}

export interface LoginData {
    email: string;
    password: string;
    rememberMe?: boolean;
    ipAddress?: string;
    userAgent?: string;
}

export interface AuthResult {
    user: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        role: string
        emailVerified: boolean;
    };
    accessToken: string;
    refreshToken: string;
}

export const registerUser = async (data: RegisterData): Promise<AuthResult> => {
    const { email, password, firstName, lastName } = data;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
    }

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join(', '));
    }

    const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
    });

    if (existingUser) {
        throw new Error('User with this email already exists');
    }

    const passwordHash = await hashPassword(password);

    const { generateOTP, sendVerificationEmail } = await import('../lib/email');
    const verificationCode = generateOTP();
    const verificationExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const user = await prisma.user.create({
        data: {
            email: email.toLowerCase(),
            passwordHash,
            firstName,
            lastName,
            emailVerified: false,
            verificationCode,
            verificationExpiry,
            isActive: true,
            role: 'USER'
        }
    });

    sendVerificationEmail(user.email, verificationCode, user.firstName || undefined)
        .catch(err => logger.error({ err }, 'Failed to send verification email'));

    const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId: user.id,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
        }
    });

    const verificationToken = generateRandomToken();
    await prisma.emailVerificationToken.create({
        data: {
            token: verificationToken,
            userId: user.id,
            expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)
        }
    });

    logger.info({ userId: user.id, token: verificationToken }, 'Email verification token generated');

    return {
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            emailVerified: user.emailVerified
        },
        accessToken,
        refreshToken
    };
};

export const loginUser = async (data: LoginData): Promise<AuthResult> => {
    const { email, password, rememberMe = false, ipAddress, userAgent } = data;

    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
    });

    if (!user) {
        logger.warn({ email }, 'Login attempt with non-existent email');
        throw new Error('Invalid email or password');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
        const remainingTime = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
        logger.warn({ userId: user.id }, 'Login attempt on locked account');
        throw new Error(`Account is locked. Try again in ${remainingTime} minutes`);
    }

    if (!user.isActive) {
        logger.warn({ userId: user.id }, 'Login attempt on inactive account');
        throw new Error('Account is inactive. Please contact support');
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
        const failedAttempts = user.failedLoginAttempts + 1;
        const updateData: any = {
            failedLoginAttempts: failedAttempts
        };

        if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
            updateData.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION);
            logger.warn({ userId: user.id, failedAttempts }, 'Account locked due to failed login attempts');
        }

        await prisma.user.update({
            where: { id: user.id },
            data: updateData
        });

        logger.warn({ userId: user.id, failedAttempts }, 'Failed login attempt');
        throw new Error('Invalid email or password');
    }

    await prisma.user.update({
        where: { id: user.id },
        data: {
            failedLoginAttempts: 0,
            lockedUntil: null,
            lastLoginAt: new Date(),
            lastLoginIp: ipAddress
        }
    });

    logger.info({ userId: user.id, email: user.email }, 'User logged in successfully');

    const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    const expiryMs = rememberMe
        ? REFRESH_TOKEN_EXPIRY_DAYS_REMEMBER_ME * 24 * 60 * 60 * 1000
        : REFRESH_TOKEN_EXPIRY_HOURS_NO_REMEMBER * 60 * 60 * 1000;

    const deviceName = parseDeviceName(userAgent);

    await prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId: user.id,
            expiresAt: new Date(Date.now() + expiryMs),
            ipAddress,
            userAgent,
            rememberMe,
            deviceName,
            lastUsedAt: new Date()
        }
    });

    return {
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            emailVerified: user.emailVerified
        },
        accessToken,
        refreshToken
    };
};

export const refreshAccessToken = async (refreshTokenString: string): Promise<{ accessToken: string; refreshToken: string }> => {
    let decoded;
    try {
        decoded = verifyRefreshToken(refreshTokenString);
    } catch (error) {
        throw new Error('Invalid or expired refresh token');
    }

    const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshTokenString },
        include: { user: true }
    });

    if (!storedToken || storedToken.isRevoked) {
        throw new Error('Refresh token has been revoked');
    }

    if (storedToken.expiresAt < new Date()) {
        throw new Error('Refresh token has expired');
    }

    await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { isRevoked: true }
    });

    const tokenPayload = {
        userId: storedToken.user.id,
        email: storedToken.user.email,
        role: storedToken.user.role
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    // Try to create the refresh token, handle unique constraint error
    try {
      await prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: storedToken.user.id,
          expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
          ipAddress: storedToken.ipAddress,
          userAgent: storedToken.userAgent
        }
      });
    } catch (error: any) {
      // If unique constraint error, the token already exists (rare race condition)
      // Generate a new token and try again
      if (error.code === 'P2002') {
        const retryRefreshToken = generateRefreshToken({ ...tokenPayload, timestamp: Date.now() });
        await prisma.refreshToken.create({
          data: {
            token: retryRefreshToken,
            userId: storedToken.user.id,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
            ipAddress: storedToken.ipAddress,
            userAgent: storedToken.userAgent
          }
        });
        logger.info({ userId: storedToken.user.id }, 'Access token refreshed (retry)');
        return {
          accessToken: newAccessToken,
          refreshToken: retryRefreshToken
        };
      }
      throw error;
    }

    logger.info({ userId: storedToken.user.id }, 'Access token refreshed');

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
};

export const logoutUser = async (refreshTokenString: string): Promise<void> => {
    const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshTokenString }
    });

    if (storedToken) {
        await prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: { isRevoked: true }
        });

        logger.info({ userId: storedToken.userId }, 'User logged out');
    }
};

export const requestPasswordReset = async (email: string): Promise<string> => {
    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
    });

    if (!user) {
        logger.warn({ email }, 'Password reset requested for non-existent email');
        return 'If an account exists, a password reset email will be sent';
    }

    const resetToken = generateRandomToken();

    await prisma.passwordResetToken.create({
        data: {
            token: resetToken,
            userId: user.id,
            expiresAt: new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)
        }
    });

    logger.info({ userId: user.id, token: resetToken }, 'Password reset token generated');

    return 'If an account exists, a password reset email will be sent';
};

export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join(', '));
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token },
        include: { user: true }
    });

    if (!resetToken || resetToken.used) {
        throw new Error('Invalid or expired reset token');
    }

    if (resetToken.expiresAt < new Date()) {
        throw new Error('Reset token has expired');
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.$transaction([
        prisma.user.update({
            where: { id: resetToken.userId },
            data: { passwordHash }
        }),
        prisma.passwordResetToken.update({
            where: { id: resetToken.id },
            data: { used: true }
        }),
        prisma.refreshToken.updateMany({
            where: { userId: resetToken.userId },
            data: { isRevoked: true }
        })
    ]);

    logger.info({ userId: resetToken.userId }, 'Password reset successfully');
};

export const verifyEmail = async (token: string): Promise<void> => {
    const verificationToken = await prisma.emailVerificationToken.findUnique({
        where: { token }
    });

    if (!verificationToken || verificationToken.used) {
        throw new Error('Invalid or expired verification token');
    }

    if (verificationToken.expiresAt < new Date()) {
        throw new Error('Verification token has expired');
    }

    await prisma.$transaction([
        prisma.user.update({
            where: { id: verificationToken.userId },
            data: { emailVerified: true }
        }),
        prisma.emailVerificationToken.update({
            where: { id: verificationToken.id },
            data: { used: true }
        })
    ]);

    logger.info({ userId: verificationToken.userId }, 'Email verified successfully');
};

export const changePassword = async (userId: string, currentPassword: string, newPassword: string): Promise<void> => {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        throw new Error('User not found');
    }

    const isPasswordValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
        throw new Error('Current password is incorrect');
    }

    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join(', '));
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.$transaction([
        prisma.user.update({
            where: { id: userId },
            data: { passwordHash }
        }),
        prisma.refreshToken.updateMany({
            where: { userId },
            data: { isRevoked: true }
        })
    ]);

    logger.info({ userId }, 'Password changed successfully');
};

export const verifyEmailWithCode = async (email: string, code: string) => {
    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
    });

    if (!user) {
        throw new Error('User not found');
    }

    if (user.emailVerified) {
        throw new Error('Email already verified');
    }

    if (!user.verificationCode) {
        throw new Error('No verification code found. Please request a new one.');
    }

    if (user.verificationExpiry && user.verificationExpiry < new Date()) {
        throw new Error('Verification code expired. Please request a new one.');
    }

    if (user.verificationCode !== code) {
        throw new Error('Invalid verification code');
    }

    await prisma.user.update({
        where: { email: email.toLowerCase() },
        data: {
            emailVerified: true,
            verificationCode: null,
            verificationExpiry: null,
        }
    });

    return { success: true, message: 'Email verified successfully' };
};

export const resendVerificationCode = async (email: string) => {
    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
    });

    if (!user) {
        throw new Error('User not found');
    }

    if (user.emailVerified) {
        throw new Error('Email already verified');
    }

    const { generateOTP, sendVerificationEmail } = await import('../lib/email');
    const verificationCode = generateOTP();
    const verificationExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
        where: { email: email.toLowerCase() },
        data: {
            verificationCode,
            verificationExpiry,
        }
    });

    await sendVerificationEmail(user.email, verificationCode, user.firstName || undefined);

    return { success: true, message: 'Verification code sent to your email' };
};

export const requestPasswordResetWithOTP = async (email: string) => {
    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
    });

    if (!user) {
        return { success: true, message: 'If an account exists, a reset code has been sent' };
    }

    const { generateOTP, sendPasswordResetEmail } = await import('../lib/email');
    const resetCode = generateOTP();
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
        where: { email: email.toLowerCase() },
        data: {
            resetCode,
            resetExpiry,
        }
    });

    await sendPasswordResetEmail(user.email, resetCode, user.firstName || undefined);

    return { success: true, message: 'If an account exists, a reset code has been sent' };
};

export const resetPasswordWithOTP = async (email: string, code: string, newPassword: string) => {
    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
    });

    if (!user) {
        throw new Error('Invalid reset code');
    }

    if (!user.resetCode) {
        throw new Error('No reset code found. Please request a new one.');
    }

    if (user.resetExpiry && user.resetExpiry < new Date()) {
        throw new Error('Reset code expired. Please request a new one.');
    }

    if (user.resetCode !== code) {
        throw new Error('Invalid reset code');
    }

    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join(', '));
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
        where: { email: email.toLowerCase() },
        data: {
            passwordHash,
            resetCode: null,
            resetExpiry: null,
            failedLoginAttempts: 0,
            lockedUntil: null,
        }
    });

    return { success: true, message: 'Password reset successfully' };
};

export const getUserSessions = async (userId: string) => {
    const sessions = await prisma.refreshToken.findMany({
        where: {
            userId,
            isRevoked: false,
            expiresAt: { gte: new Date() }
        },
        orderBy: { lastUsedAt: 'desc' },
        select: {
            id: true,
            deviceName: true,
            ipAddress: true,
            userAgent: true,
            rememberMe: true,
            createdAt: true,
            lastUsedAt: true,
            expiresAt: true
        }
    });

    return sessions;
};

export const revokeSession = async (userId: string, sessionId: string) => {
    const session = await prisma.refreshToken.findFirst({
        where: { id: sessionId, userId }
    });

    if (!session) {
        throw new Error('Session not found');
    }

    await prisma.refreshToken.update({
        where: { id: sessionId },
        data: { isRevoked: true }
    });

    logger.info({ userId, sessionId }, 'Session revoked');
};

export const revokeAllOtherSessions = async (userId: string, currentSessionId: string) => {
    await prisma.refreshToken.updateMany({
        where: {
            userId,
            id: { not: currentSessionId },
            isRevoked: false
        },
        data: { isRevoked: true }
    });

    logger.info({ userId }, 'All other sessions revoked');
};

export const updateSessionLastUsed = async (token: string) => {
    await prisma.refreshToken.updateMany({
        where: { token },
        data: { lastUsedAt: new Date() }
    });
};
