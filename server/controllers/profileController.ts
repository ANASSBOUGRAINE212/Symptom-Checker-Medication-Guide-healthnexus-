import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const ProfileUpdateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
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

    // Only update user if firstName or lastName is provided
    if (validatedData.firstName !== undefined || validatedData.lastName !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          ...(validatedData.firstName !== undefined ? { firstName: validatedData.firstName } : {}),
          ...(validatedData.lastName !== undefined ? { lastName: validatedData.lastName } : {}),
        }
      });
    }

    // Always update all provided fields for UserProfile, never default to 'unspecified'.
    // If a field is sent as an empty string, set it to null (clear it).
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
