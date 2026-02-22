import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { doctorId, appointmentDate, appointmentTime, reason } = req.body;
    
    // Validate appointment date is not in the past
    const appointmentDateObj = new Date(appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (appointmentDateObj < today) {
      return res.status(400).json({ error: 'Cannot book appointments in the past' });
    }
    
    // Check if doctor exists
    const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    const appointment = await prisma.appointment.create({
      data: {
        userId,
        doctorId,
        appointmentDate: appointmentDateObj,
        appointmentTime,
        reason,
        status: 'PENDING'
      },
      include: {
        doctor: {
          include: {
            user: { select: { firstName: true, lastName: true } }
          }
        }
      }
    });
    
    res.status(201).json(appointment);
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
};

export const getUserAppointments = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const appointments = await prisma.appointment.findMany({
      where: { userId },
      include: {
        doctor: {
          include: {
            user: { select: { firstName: true, lastName: true } }
          }
        }
      },
      orderBy: { appointmentDate: 'desc' }
    });
    
    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

// Get appointment by ID
export const getAppointmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        doctor: {
          include: {
            user: { select: { firstName: true, lastName: true } }
          }
        },
        user: { select: { firstName: true, lastName: true, email: true } }
      }
    });
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // Check authorization FIRST - user can only see their own appointments
    // unless they are the doctor or admin
    const isOwner = appointment.userId === userId;
    const isDoctor = userRole === 'DOCTOR' && appointment.doctor.userId === userId;
    const isAdmin = userRole === 'ADMIN';
    
    if (!isOwner && !isDoctor && !isAdmin) {
      // Return 403 for authenticated users who don't have access
      // This ensures we check authorization before authentication
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    res.json(appointment);
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
};

export const getDoctorAppointments = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const doctor = await prisma.doctor.findUnique({ where: { userId } });
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }
    
    const appointments = await prisma.appointment.findMany({
      where: { doctorId: doctor.id },
      include: {
        user: {
          include: { 
            profile: true 
          }
        }
      },
      orderBy: { appointmentDate: 'desc' }
    });
    
    // Transform to match expected format with patient field
    const transformedAppointments = appointments.map(apt => ({
      id: apt.id,
      date: apt.appointmentDate,
      time: apt.appointmentTime,
      status: apt.status,
      reason: apt.reason || '',
      patient: {
        id: apt.user.id,
        firstName: apt.user.firstName,
        lastName: apt.user.lastName,
        email: apt.user.email,
        profile: apt.user.profile
      }
    }));
    
    res.json(transformedAppointments);
  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

// Admin: Get all appointments
export const getAllAppointments = async (req: Request, res: Response) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        user: {
          include: { 
            profile: true 
          }
        },
        doctor: {
          include: {
            user: true
          }
        }
      },
      orderBy: { appointmentDate: 'desc' }
    });
    
    // Transform to match expected format
    const transformedAppointments = appointments.map(apt => ({
      id: apt.id,
      date: apt.appointmentDate,
      time: apt.appointmentTime,
      status: apt.status,
      reason: apt.reason || '',
      patient: {
        id: apt.user.id,
        firstName: apt.user.firstName,
        lastName: apt.user.lastName,
        email: apt.user.email,
        profile: apt.user.profile
      },
      doctor: apt.doctor
    }));
    
    res.json(transformedAppointments);
  } catch (error) {
    console.error('Get all appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

export const updateAppointmentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, visited, needsFollowUp, diagnosisNotes, notes } = req.body;
    
    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        status,
        visited,
        needsFollowUp,
        diagnosisNotes,
        notes
      },
      include: {
        user: { select: { firstName: true, lastName: true } },
        doctor: {
          include: {
            user: { select: { firstName: true, lastName: true } }
          }
        }
      }
    });
    
    res.json(appointment);
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
};

export const cancelAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    
    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // Check authorization before checking if appointment exists
    if (appointment.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });
    
    res.json({ message: 'Appointment cancelled successfully', ...updated });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
};
