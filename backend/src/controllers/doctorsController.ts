import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/password.js';

const prisma = new PrismaClient();

export const getAllDoctors = async (req: Request, res: Response) => {
  try {
    const { specialty, city, search, includeUnverified } = req.query;
    
    // Build where clause based on includeUnverified flag
    const where: any = {};
    
    // If includeUnverified is NOT true, only show active AND verified doctors
    if (includeUnverified !== 'true') {
      where.isActive = true;
      where.isVerified = true;
    }
    // If includeUnverified IS true, show all doctors (no filter on isActive/isVerified)
    
    if (specialty) where.specialty = specialty as string;
    if (city) where.city = city as string;
    if (search) {
      where.OR = [
        { user: { firstName: { contains: search as string } } },
        { user: { lastName: { contains: search as string } } },
        { specialty: { contains: search as string } }
      ];
    }
    
    const doctors = await prisma.doctor.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        schedules: { where: { isActive: true } }
      }
    });
    
    // Never send licenseNumberHash to frontend
    const sanitizedDoctors = doctors.map(({ licenseNumberHash, ...doctor }) => doctor);
    
    res.json(sanitizedDoctors);
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
};

export const getDoctorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        schedules: { where: { isActive: true } }
      }
    });
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    // Never send licenseNumberHash to frontend
    const { licenseNumberHash, ...sanitizedDoctor } = doctor;
    
    res.json(sanitizedDoctor);
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({ error: 'Failed to fetch doctor' });
  }
};

// New endpoint for doctor self-registration
export const registerDoctor = async (req: Request, res: Response) => {
  try {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      specialty, 
      address, 
      city, 
      country, 
      phone, 
      bio, 
      yearsOfExperience, 
      education, 
      languages,
      licenseNumber,
      schedules,
      userId // Optional: if user is already logged in
    } = req.body;
    
    // Validate required fields
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    if (!specialty || !licenseNumber || !education) {
      return res.status(400).json({ error: 'Specialty, license number, and education are required' });
    }
    
    if (!phone || !address || !city || !country) {
      return res.status(400).json({ error: 'Phone, address, city, and country are required' });
    }
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    
    // Case 1: Existing user applying to become a doctor
    if (existingUser) {
      // Check if user already has a doctor profile
      const existingDoctor = await prisma.doctor.findUnique({ 
        where: { userId: existingUser.id } 
      });
      
      if (existingDoctor) {
        return res.status(400).json({ error: 'You already have a doctor application. Please wait for admin approval.' });
      }
      
      const licenseNumberHash = await hashPassword(licenseNumber);
      
      // Create doctor profile for existing user
      const doctor = await prisma.doctor.create({
        data: {
          userId: existingUser.id,
          specialty,
          address,
          city,
          country,
          phone,
          bio,
          yearsOfExperience,
          education,
          languages,
          licenseNumberHash,
          isActive: false,
          isVerified: false,
          schedules: schedules && schedules.length > 0 ? {
            create: schedules.map((s: any) => ({
              dayOfWeek: s.dayOfWeek,
              startTime: s.startTime,
              endTime: s.endTime
            }))
          } : undefined
        },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          schedules: true
        }
      });
      
      // Update user role to DOCTOR
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { role: 'DOCTOR' }
      });
      
      const { licenseNumberHash: _, ...sanitizedDoctor } = doctor;
      
      return res.status(201).json(sanitizedDoctor);
    }
    
    // Case 2: New user registering as a doctor
    if (!password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Password, first name, and last name are required for new users' });
    }
    
    const passwordHash = await hashPassword(password);
    const licenseNumberHash = await hashPassword(licenseNumber);
    
    const doctor = await prisma.doctor.create({
      data: {
        user: {
          create: {
            email,
            passwordHash,
            firstName,
            lastName,
            role: 'DOCTOR',
            emailVerified: false
          }
        },
        specialty,
        address,
        city,
        country,
        phone,
        bio,
        yearsOfExperience,
        education,
        languages,
        licenseNumberHash,
        isActive: false,
        isVerified: false,
        schedules: schedules && schedules.length > 0 ? {
          create: schedules.map((s: any) => ({
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime
          }))
        } : undefined
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        schedules: true
      }
    });
    
    // Never send licenseNumberHash to frontend
    const { licenseNumberHash: _, ...sanitizedDoctor } = doctor;
    
    res.status(201).json(sanitizedDoctor);
  } catch (error) {
    console.error('Register doctor error:', error);
    res.status(500).json({ error: 'Failed to register doctor' });
  }
};

// Admin endpoint to create doctor (with immediate verification)
export const createDoctor = async (req: Request, res: Response) => {
  try {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      specialty, 
      address, 
      city, 
      country, 
      phone, 
      bio, 
      yearsOfExperience, 
      education, 
      languages, 
      schedules,
      licenseNumber 
    } = req.body;
    
    if (!licenseNumber) {
      return res.status(400).json({ error: 'Medical license number is required' });
    }
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    const passwordHash = await hashPassword(password);
    const licenseNumberHash = await hashPassword(licenseNumber);
    
    const doctor = await prisma.doctor.create({
      data: {
        user: {
          create: {
            email,
            passwordHash,
            firstName,
            lastName,
            role: 'DOCTOR',
            emailVerified: true
          }
        },
        specialty,
        address,
        city,
        country,
        phone,
        bio,
        yearsOfExperience,
        education,
        languages,
        licenseNumberHash,
        isActive: true,     // Admin-created doctors are active
        isVerified: true,   // Admin-created doctors are verified
        schedules: schedules ? {
          create: schedules.map((s: any) => ({
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime
          }))
        } : undefined
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        schedules: true
      }
    });
    
    // Never send licenseNumberHash to frontend
    const { licenseNumberHash: _, ...sanitizedDoctor } = doctor;
    
    res.status(201).json(sanitizedDoctor);
  } catch (error) {
    console.error('Create doctor error:', error);
    res.status(500).json({ error: 'Failed to create doctor' });
  }
};

// Admin endpoint to approve/verify doctor
export const verifyDoctor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isVerified, isActive } = req.body;
    
    const doctor = await prisma.doctor.update({
      where: { id },
      data: {
        isVerified: isVerified !== undefined ? isVerified : true,
        isActive: isActive !== undefined ? isActive : true
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        schedules: true
      }
    });
    
    // Never send licenseNumberHash to frontend
    const { licenseNumberHash, ...sanitizedDoctor } = doctor;
    
    res.json(sanitizedDoctor);
  } catch (error) {
    console.error('Verify doctor error:', error);
    res.status(500).json({ error: 'Failed to verify doctor' });
  }
};

export const updateDoctor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const { firstName, lastName, specialty, address, city, country, phone, bio, yearsOfExperience, education, languages, isActive } = req.body;
    
    // If no ID in params, doctor is updating their own profile
    let doctorId = id;
    if (!doctorId) {
      const doctor = await prisma.doctor.findUnique({ where: { userId } });
      if (!doctor) {
        return res.status(404).json({ error: 'Doctor profile not found' });
      }
      doctorId = doctor.id;
    }
    
    // If doctor is updating someone else's profile, check authorization first
    if (userRole === 'DOCTOR' && id) {
      const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
      if (!doctor) {
        return res.status(404).json({ error: 'Doctor profile not found' });
      }
      if (doctor.userId !== userId) {
        return res.status(403).json({ error: 'You can only update your own profile' });
      }
    }
    
    const doctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        specialty,
        address,
        city,
        country,
        phone,
        bio,
        yearsOfExperience,
        education,
        languages,
        // Only admins can change isActive status
        ...(userRole === 'ADMIN' && isActive !== undefined ? { isActive } : {}),
        user: firstName || lastName ? {
          update: {
            firstName,
            lastName
          }
        } : undefined
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        schedules: true
      }
    });
    
    // Never send licenseNumberHash to frontend
    const { licenseNumberHash, ...sanitizedDoctor } = doctor;
    
    res.json(sanitizedDoctor);
  } catch (error) {
    console.error('Update doctor error:', error);
    res.status(500).json({ error: 'Failed to update doctor' });
  }
};

export const deleteDoctor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.doctor.update({
      where: { id },
      data: { isActive: false }
    });
    
    res.json({ message: 'Doctor deactivated successfully' });
  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({ error: 'Failed to delete doctor' });
  }
};

// Admin endpoint to reject doctor application (removes doctor profile)
export const rejectDoctor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get the doctor to find the userId
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      select: { userId: true }
    });
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    // Delete all schedules first (foreign key constraint)
    await prisma.doctorSchedule.deleteMany({
      where: { doctorId: id }
    });
    
    // Delete the doctor profile
    await prisma.doctor.delete({
      where: { id }
    });
    
    // Change user role back to USER
    await prisma.user.update({
      where: { id: doctor.userId },
      data: { role: 'USER' }
    });
    
    res.json({ message: 'Doctor application rejected and removed' });
  } catch (error) {
    console.error('Reject doctor error:', error);
    res.status(500).json({ error: 'Failed to reject doctor' });
  }
};

export const updateDoctorSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const { schedules } = req.body;
    
    // If no ID in params, doctor is updating their own schedule
    let doctorId = id;
    if (!doctorId) {
      const doctor = await prisma.doctor.findUnique({ where: { userId } });
      if (!doctor) {
        return res.status(404).json({ error: 'Doctor profile not found' });
      }
      doctorId = doctor.id;
    }
    
    // If doctor is updating their own schedule, verify they own it
    if (userRole === 'DOCTOR' && id) {
      const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
      if (doctor?.userId !== userId) {
        return res.status(403).json({ error: 'You can only update your own schedule' });
      }
    }
    
    await prisma.doctorSchedule.deleteMany({ where: { doctorId } });
    
    if (schedules && schedules.length > 0) {
      await prisma.doctorSchedule.createMany({
        data: schedules.map((s: any) => ({
          doctorId,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime
        }))
      });
    }
    
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { schedules: true }
    });
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    // Never send licenseNumberHash to frontend
    const { licenseNumberHash, ...sanitizedDoctor } = doctor;
    
    res.json(sanitizedDoctor);
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ error: 'Failed to update schedule' });
  }
};

// Create schedule for a doctor
export const createDoctorSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const { dayOfWeek, startTime, endTime } = req.body;
    
    // Validate required fields
    if (!dayOfWeek || !startTime || !endTime) {
      return res.status(400).json({ error: 'Day of week, start time, and end time are required' });
    }
    
    // Validate dayOfWeek (0-6 for Sunday-Saturday)
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return res.status(400).json({ error: 'Day of week must be between 0 (Sunday) and 6 (Saturday)' });
    }
    
    // Validate time format and logic
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({ error: 'Invalid time format. Use HH:MM format' });
    }
    
    // Check if end time is after start time
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    if (endMinutes <= startMinutes) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }
    
    // If doctor is creating schedule, verify they own the profile
    if (userRole === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({ where: { id } });
      if (doctor?.userId !== userId) {
        return res.status(403).json({ error: 'You can only create schedules for your own profile' });
      }
    }
    
    // Check for duplicate schedule on the same day
    const existingSchedule = await prisma.doctorSchedule.findFirst({
      where: {
        doctorId: id,
        dayOfWeek,
        isActive: true
      }
    });
    
    if (existingSchedule) {
      return res.status(400).json({ error: 'A schedule already exists for this day of the week' });
    }
    
    const schedule = await prisma.doctorSchedule.create({
      data: {
        doctorId: id,
        dayOfWeek,
        startTime,
        endTime,
        isActive: true
      }
    });
    
    res.status(201).json(schedule);
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
};

// Get doctor's schedule
export const getDoctorSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const schedules = await prisma.doctorSchedule.findMany({
      where: { 
        doctorId: id,
        isActive: true
      },
      orderBy: { dayOfWeek: 'asc' }
    });
    
    res.json(schedules);
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
};

// Update a specific schedule
export const updateSchedule = async (req: Request, res: Response) => {
  try {
    const { scheduleId } = req.params;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const { dayOfWeek, startTime, endTime, isActive } = req.body;
    
    // Get the schedule to verify ownership
    const schedule = await prisma.doctorSchedule.findUnique({
      where: { id: scheduleId },
      include: { doctor: true }
    });
    
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    // If doctor is updating schedule, verify they own it
    if (userRole === 'DOCTOR' && schedule.doctor.userId !== userId) {
      return res.status(403).json({ error: 'You can only update your own schedules' });
    }
    
    const updatedSchedule = await prisma.doctorSchedule.update({
      where: { id: scheduleId },
      data: {
        ...(dayOfWeek !== undefined && { dayOfWeek }),
        ...(startTime !== undefined && { startTime }),
        ...(endTime !== undefined && { endTime }),
        ...(isActive !== undefined && { isActive })
      }
    });
    
    res.json(updatedSchedule);
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ error: 'Failed to update schedule' });
  }
};

// Delete a specific schedule
export const deleteSchedule = async (req: Request, res: Response) => {
  try {
    const { scheduleId } = req.params;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    
    // Get the schedule to verify ownership
    const schedule = await prisma.doctorSchedule.findUnique({
      where: { id: scheduleId },
      include: { doctor: true }
    });
    
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    // If doctor is deleting schedule, verify they own it
    if (userRole === 'DOCTOR' && schedule.doctor.userId !== userId) {
      return res.status(403).json({ error: 'You can only delete your own schedules' });
    }
    
    await prisma.doctorSchedule.delete({
      where: { id: scheduleId }
    });
    
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
};
