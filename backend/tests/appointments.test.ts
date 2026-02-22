// Appointment Tests
import request from 'supertest';
import { createServer } from '../src/index';
import { cleanupTestData, createTestUser, createTestDoctor, createTestAppointment, generateTokens } from './helpers/testHelpers';
import { PrismaClient } from '@prisma/client';

const app = createServer();
const prisma = new PrismaClient();

describe('Appointments', () => {
  // Removed beforeEach cleanup to prevent foreign key constraint errors
  // Tests use unique emails with timestamps to avoid conflicts

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('POST /api/v1/appointments - Create Appointment', () => {
    it('should allow user to create appointment with verified doctor', async () => {
      const user = await createTestUser();
      const doctor = await createTestDoctor();
      const { accessToken } = await generateTokens(user.id, 'USER');
      
      const res = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          doctorId: doctor.id,
          appointmentDate: '2026-03-15',
          appointmentTime: '10:00',
          reason: 'Regular checkup',
        })
        .expect('Content-Type', /json/)
        .expect(201);
      
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('status', 'PENDING');
      expect(res.body).toHaveProperty('doctorId', doctor.id);
    });

    it('should reject appointment without authentication', (done) => {
      createTestDoctor().then((doctor) => {
        request(app)
          .post('/api/v1/appointments')
          .send({
            doctorId: doctor.id,
            appointmentDate: '2026-03-15',
            appointmentTime: '10:00',
            reason: 'Regular checkup',
          })
          .expect(401)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body).toHaveProperty('error');
            return done();
          });
      });
    });

    it('should reject appointment with past date', async () => {
      const user = await createTestUser();
      const doctor = await createTestDoctor();
      const { accessToken } = await generateTokens(user.id, 'USER');
      
      const res = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          doctorId: doctor.id,
          appointmentDate: '2020-01-01',
          appointmentTime: '10:00',
          reason: 'Regular checkup',
        })
        .expect(400);
      
      expect(res.body).toHaveProperty('error');
    });

    it('should reject appointment with invalid doctor', async () => {
      const user = await createTestUser();
      const { accessToken } = await generateTokens(user.id, 'USER');
      
      const res = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          doctorId: 'invalid-doctor-id',
          appointmentDate: '2026-03-15',
          appointmentTime: '10:00',
          reason: 'Regular checkup',
        })
        .expect(404);
      
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/appointments - Get User Appointments', () => {
    it('should get all appointments for authenticated user', async () => {
      const user = await createTestUser();
      const doctor = await createTestDoctor();
      await createTestAppointment(user.id, doctor.id);
      const { accessToken } = await generateTokens(user.id, 'USER');
      
      const res = await request(app)
        .get('/api/v1/appointments')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('doctorId', doctor.id);
    });

    it('should not show other users appointments', async () => {
      const user1 = await createTestUser({ email: `user1-${Date.now()}@test.com` });
      const user2 = await createTestUser({ email: `user2-${Date.now()}@test.com` });
      const doctor = await createTestDoctor();
      
      // Create appointment for user1
      await createTestAppointment(user1.id, doctor.id);
      const { accessToken } = await generateTokens(user2.id, 'USER');
      
      // User2 should not see user1's appointments
      const res = await request(app)
        .get('/api/v1/appointments')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      
      expect(res.body.length).toBe(0);
    });
  });

  describe('GET /api/v1/appointments/doctor - Get Doctor Appointments', () => {
    it('should allow doctor to see their appointments', async () => {
      const user = await createTestUser();
      const doctor = await createTestDoctor();
      await createTestAppointment(user.id, doctor.id);
      const { accessToken } = await generateTokens(doctor.userId, 'DOCTOR');
      
      const res = await request(app)
        .get('/api/v1/appointments/doctor')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should reject non-doctor access', async () => {
      const user = await createTestUser();
      const { accessToken } = await generateTokens(user.id, 'USER');
      
      const res = await request(app)
        .get('/api/v1/appointments/doctor')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
      
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/v1/appointments/:id/status - Update Appointment Status', () => {
    it('should allow doctor to confirm appointment', async () => {
      const user = await createTestUser();
      const doctor = await createTestDoctor();
      const appointment = await createTestAppointment(user.id, doctor.id);
      const { accessToken } = await generateTokens(doctor.userId, 'DOCTOR');
      
      const res = await request(app)
        .put(`/api/v1/appointments/${appointment.id}/status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'CONFIRMED' })
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(res.body).toHaveProperty('status', 'CONFIRMED');
    });

    it('should allow doctor to complete appointment', async () => {
      const user = await createTestUser();
      const doctor = await createTestDoctor();
      const appointment = await createTestAppointment(user.id, doctor.id);
      const { accessToken } = await generateTokens(doctor.userId, 'DOCTOR');
      
      const res = await request(app)
        .put(`/api/v1/appointments/${appointment.id}/status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'COMPLETED' })
        .expect(200);
      
      expect(res.body).toHaveProperty('status', 'COMPLETED');
    });

    it('should reject status update by non-doctor', async () => {
      const user = await createTestUser();
      const doctor = await createTestDoctor();
      const appointment = await createTestAppointment(user.id, doctor.id);
      const { accessToken } = await generateTokens(user.id, 'USER');
      
      const res = await request(app)
        .put(`/api/v1/appointments/${appointment.id}/status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'CONFIRMED' })
        .expect(403);
      
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/v1/appointments/:id - Cancel Appointment', () => {
    it('should allow user to cancel their appointment', async () => {
      const user = await createTestUser();
      const doctor = await createTestDoctor();
      const appointment = await createTestAppointment(user.id, doctor.id);
      const { accessToken } = await generateTokens(user.id, 'USER');
      
      const res = await request(app)
        .delete(`/api/v1/appointments/${appointment.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      
      expect(res.body).toHaveProperty('message');
      
      // Verify appointment is cancelled
      const apt = await prisma.appointment.findUnique({ where: { id: appointment.id } });
      expect(apt?.status).toBe('CANCELLED');
    });

    it('should not allow user to cancel other users appointment', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser({ email: 'user2@test.com' });
      const doctor = await createTestDoctor();
      const appointment = await createTestAppointment(user1.id, doctor.id);
      const { accessToken } = await generateTokens(user2.id, 'USER');
      
      const res = await request(app)
        .delete(`/api/v1/appointments/${appointment.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
      
      expect(res.body).toHaveProperty('error');
    });
  });
});
