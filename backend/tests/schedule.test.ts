// Doctor Schedule Tests
import request from 'supertest';
import { createServer } from '../src/index';
import { cleanupTestData, createTestDoctor, createTestUser, generateTokens } from './helpers/testHelpers';
import { PrismaClient } from '@prisma/client';

const app = createServer();
const prisma = new PrismaClient();

describe('Doctor Schedule', () => {
  // Removed beforeEach cleanup to prevent foreign key constraint errors
  // Tests use unique emails with timestamps to avoid conflicts

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('POST /api/v1/doctors/:id/schedule - Create Schedule', () => {
    it('should allow doctor to create schedule', async () => {
      const doctor = await createTestDoctor();
      const { accessToken } = await generateTokens(doctor.userId, 'DOCTOR');
      
      const res = await request(app)
        .post(`/api/v1/doctors/${doctor.id}/schedule`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          dayOfWeek: 1, // Monday
          startTime: '09:00',
          endTime: '17:00',
        })
        .expect('Content-Type', /json/)
        .expect(201);
      
      expect(res.body).toHaveProperty('dayOfWeek', 1);
      expect(res.body).toHaveProperty('startTime', '09:00');
      expect(res.body).toHaveProperty('endTime', '17:00');
    });

    it('should reject schedule creation by non-doctor', async () => {
      const doctor = await createTestDoctor();
      const user = await createTestUser({ role: 'USER' });
      const { accessToken } = await generateTokens(user.id, 'USER');
      
      const res = await request(app)
        .post(`/api/v1/doctors/${doctor.id}/schedule`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          dayOfWeek: 1,
          startTime: '09:00',
          endTime: '17:00',
        })
        .expect(403);
      
      expect(res.body).toHaveProperty('error');
    });

    it('should reject invalid day of week', async () => {
      const doctor = await createTestDoctor();
      const { accessToken } = await generateTokens(doctor.userId, 'DOCTOR');
      
      const res = await request(app)
        .post(`/api/v1/doctors/${doctor.id}/schedule`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          dayOfWeek: 8, // Invalid
          startTime: '09:00',
          endTime: '17:00',
        })
        .expect(400);
      
      expect(res.body).toHaveProperty('error');
    });

    it('should reject end time before start time', async () => {
      const doctor = await createTestDoctor();
      const { accessToken } = await generateTokens(doctor.userId, 'DOCTOR');
      
      const res = await request(app)
        .post(`/api/v1/doctors/${doctor.id}/schedule`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          dayOfWeek: 1,
          startTime: '17:00',
          endTime: '09:00',
        })
        .expect(400);
      
      expect(res.body).toHaveProperty('error');
    });

    it('should reject duplicate schedule for same day', async () => {
      const doctor = await createTestDoctor();
      const { accessToken } = await generateTokens(doctor.userId, 'DOCTOR');
      
      await request(app)
        .post(`/api/v1/doctors/${doctor.id}/schedule`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          dayOfWeek: 1,
          startTime: '09:00',
          endTime: '17:00',
        });

      // Try to create duplicate
      const res = await request(app)
        .post(`/api/v1/doctors/${doctor.id}/schedule`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          dayOfWeek: 1,
          startTime: '10:00',
          endTime: '18:00',
        })
        .expect(400);
      
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/doctors/:id/schedule - Get Doctor Schedule', () => {
    it('should get doctor schedule', async () => {
      const doctor = await createTestDoctor();
      
      await prisma.doctorSchedule.create({
        data: {
          doctorId: doctor.id,
          dayOfWeek: 1,
          startTime: '09:00',
          endTime: '17:00',
        },
      });
      
      const res = await request(app)
        .get(`/api/v1/doctors/${doctor.id}/schedule`)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('dayOfWeek', 1);
    });

    it('should return empty array for doctor with no schedule', async () => {
      const doctor = await createTestDoctor();
      
      const res = await request(app)
        .get(`/api/v1/doctors/${doctor.id}/schedule`)
        .expect(200);
      
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });

  describe('PUT /api/v1/doctors/schedule/:scheduleId - Update Schedule', () => {
    it('should allow doctor to update their schedule', async () => {
      const doctor = await createTestDoctor();
      
      const schedule = await prisma.doctorSchedule.create({
        data: {
          doctorId: doctor.id,
          dayOfWeek: 1,
          startTime: '09:00',
          endTime: '17:00',
        },
      });
      
      const { accessToken } = await generateTokens(doctor.userId, 'DOCTOR');
      
      const res = await request(app)
        .put(`/api/v1/doctors/schedule/${schedule.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          startTime: '10:00',
          endTime: '18:00',
        })
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(res.body).toHaveProperty('startTime', '10:00');
      expect(res.body).toHaveProperty('endTime', '18:00');
    });

    it('should reject update by different doctor', async () => {
      const doctor1 = await createTestDoctor();
      const doctor2 = await createTestDoctor();
      
      const schedule = await prisma.doctorSchedule.create({
        data: {
          doctorId: doctor1.id,
          dayOfWeek: 1,
          startTime: '09:00',
          endTime: '17:00',
        },
      });
      
      const { accessToken } = await generateTokens(doctor2.userId, 'DOCTOR');
      
      const res = await request(app)
        .put(`/api/v1/doctors/schedule/${schedule.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          startTime: '10:00',
          endTime: '18:00',
        })
        .expect(403);
      
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/v1/doctors/schedule/:scheduleId - Delete Schedule', () => {
    it('should allow doctor to delete their schedule', async () => {
      const doctor = await createTestDoctor();
      
      const schedule = await prisma.doctorSchedule.create({
        data: {
          doctorId: doctor.id,
          dayOfWeek: 1,
          startTime: '09:00',
          endTime: '17:00',
        },
      });
      
      const { accessToken } = await generateTokens(doctor.userId, 'DOCTOR');
      
      const res = await request(app)
        .delete(`/api/v1/doctors/schedule/${schedule.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      
      expect(res.body).toHaveProperty('message');
      
      // Verify schedule is deleted
      const sch = await prisma.doctorSchedule.findUnique({ where: { id: schedule.id } });
      expect(sch).toBeNull();
    });

    it('should reject deletion by different doctor', async () => {
      const doctor1 = await createTestDoctor();
      const doctor2 = await createTestDoctor();
      
      const schedule = await prisma.doctorSchedule.create({
        data: {
          doctorId: doctor1.id,
          dayOfWeek: 1,
          startTime: '09:00',
          endTime: '17:00',
        },
      });
      
      const { accessToken } = await generateTokens(doctor2.userId, 'DOCTOR');
      
      const res = await request(app)
        .delete(`/api/v1/doctors/schedule/${schedule.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
      
      expect(res.body).toHaveProperty('error');
    });
  });
});
