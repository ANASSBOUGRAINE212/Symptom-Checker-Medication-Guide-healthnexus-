import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { hashPassword, verifyPassword } from '../lib/password.js';

const prisma = new PrismaClient();

const ProfileUpdateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  country: z.string().optional(),
  height: z.union([z.string(), z.number()]).optional().nullable(),
  weight: z.union([z.string(), z.number()]).optional().nullable(),
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
  darkMode: z.boolean().optional(),
  dataSharing: z.boolean().optional(),
});

export async function getUserProfile(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });
    if (!userProfile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(userProfile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
}

export async function updateUserProfile(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const validatedData = ProfileUpdateSchema.parse(req.body);

    if (validatedData.firstName !== undefined || validatedData.lastName !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          ...(validatedData.firstName !== undefined ? { firstName: validatedData.firstName } : {}),
          ...(validatedData.lastName !== undefined ? { lastName: validatedData.lastName } : {}),
        }
      });
    }

    function clean(val: any) {
      if (val === undefined) return undefined;
      if (typeof val === 'string' && val.trim() === '') return null;
      return val;
    }

    const updateData: any = {};
    for (const key of Object.keys(validatedData)) {
      if (validatedData[key] !== undefined) {
        if (key === 'height' || key === 'weight') {
          updateData[key] = clean(validatedData[key]) !== undefined && clean(validatedData[key]) !== null ? Number(validatedData[key]) : clean(validatedData[key]);
        } else {
          updateData[key] = clean(validatedData[key]);
        }
      }
    }

    const userProfile = await prisma.userProfile.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        ...updateData
      },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          }
        }
      }
    });
    res.json(userProfile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
}

export async function getUserTheme(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId },
      select: {
        darkMode: true
      }
    });
    const darkMode = userProfile?.darkMode ?? false;
    res.json({ darkMode });
  } catch (error) {
    console.error('Error fetching theme:', error);
    res.status(500).json({ error: 'Failed to fetch theme preference' });
  }
}

export async function updateUserTheme(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { darkMode } = req.body;
    const userProfile = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        darkMode
      },
      create: {
        userId,
        darkMode
      }
    });
    res.json({ darkMode: userProfile.darkMode });
  } catch (error) {
    console.error('Error updating theme:', error);
    res.status(500).json({ error: 'Failed to update theme preference' });
  }
}

// Get authenticated user's own profile
export async function getOwnProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get profile data if exists
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId }
    });
    
    // Return combined data
    const response: any = {
      ...user,
      profile: userProfile || null
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
}

// Update authenticated user's own profile
export async function updateOwnProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Validate email format if provided
    if (req.body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(req.body.email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    }
    
    // Validate blood type if provided
    const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (req.body.bloodType && !validBloodTypes.includes(req.body.bloodType)) {
      return res.status(400).json({ error: 'Invalid blood type' });
    }
    
    // Validate height and weight
    if (req.body.height !== undefined && req.body.height !== null) {
      const height = Number(req.body.height);
      if (height < 0) {
        return res.status(400).json({ error: 'Height cannot be negative' });
      }
    }
    
    if (req.body.weight !== undefined && req.body.weight !== null) {
      const weight = Number(req.body.weight);
      if (weight < 0) {
        return res.status(400).json({ error: 'Weight cannot be negative' });
      }
    }
    
    const validatedData = ProfileUpdateSchema.parse(req.body);

    // Update user basic information if provided
    if (validatedData.firstName !== undefined || validatedData.lastName !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          ...(validatedData.firstName !== undefined ? { firstName: validatedData.firstName } : {}),
          ...(validatedData.lastName !== undefined ? { lastName: validatedData.lastName } : {}),
        }
      });
    }

    function clean(val: any) {
      if (val === undefined) return undefined;
      if (typeof val === 'string' && val.trim() === '') return null;
      return val;
    }

    const updateData: any = {};
    for (const key of Object.keys(validatedData)) {
      if (validatedData[key] !== undefined && key !== 'firstName' && key !== 'lastName') {
        if (key === 'height' || key === 'weight') {
          updateData[key] = clean(validatedData[key]) !== undefined && clean(validatedData[key]) !== null ? Number(validatedData[key]) : clean(validatedData[key]);
        } else if (key === 'dateOfBirth' && validatedData[key]) {
          // Convert dateOfBirth string to Date object
          updateData[key] = new Date(validatedData[key]);
        } else {
          updateData[key] = clean(validatedData[key]);
        }
      }
    }

    // Update or create profile
    const userProfile = await prisma.userProfile.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        ...updateData
      }
    });
    
    // Get updated user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    // Return combined data
    const response: any = {
      ...user,
      profile: userProfile
    };
    
    res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
}

// Change password for authenticated user
export async function changePassword(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    // Validate new password strength
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }
    
    // Check for at least one uppercase, one lowercase, one number, and one special character
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      return res.status(400).json({ 
        error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' 
      });
    }
    
    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, user.passwordHash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);
    
    // Update password - use try/catch to handle if user was deleted
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash }
      });
    } catch (updateError: any) {
      if (updateError.code === 'P2025') {
        return res.status(404).json({ error: 'User not found' });
      }
      throw updateError;
    }
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
}
