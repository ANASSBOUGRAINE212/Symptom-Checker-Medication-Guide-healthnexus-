// Authorization Tests
import request from 'supertest';
import { createServer } from '../src/index';
import { cleanupTestData, createTestUser, createTestAdmin, createTestDoctor, generateTokens } from './helpers/testHelpers';

const app = createServer();

describe('Authorization', () => {
  // Removed beforeEach cleanup to prevent foreign key constraint errors
  // Tests use unique emails with timestamps to avoid conflicts

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('Protected Routes - Token Required', () => {
    it('should reject request without token', (done) => {
      request(app)
        .get('/api/v1/profile')
        .expect(401)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).toHaveProperty('error');
          return done();
        });
    });

    it('should reject request with invalid token', (done) => {
      request(app)
        .get('/api/v1/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).toHaveProperty('error');
          return done();
        });
    });

    it('should accept request with valid token', async () => {
      const user = await createTestUser();
      const { accessToken } = await generateTokens(user.id, user.role);
      
      await request(app)
        .get('/api/v1/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });
  });

  describe('Role-Based Access Control - USER', () => {
    it('USER cannot access admin routes', async () => {
      const user = await createTestUser({ role: 'USER' });
      const { accessToken } = await generateTokens(user.id, 'USER');
      
      const res = await request(app)
        .get('/api/v1/admin/stats')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
      
      expect(res.body).toHaveProperty('error');
    });

    it('USER cannot access doctor-only routes', async () => {
      const user = await createTestUser({ role: 'USER' });
      const { accessToken } = await generateTokens(user.id, 'USER');
      
      const res = await request(app)
        .get('/api/v1/appointments/doctor')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
      
      expect(res.body).toHaveProperty('error');
    });

    it('USER can access their own profile', async () => {
      const user = await createTestUser({ role: 'USER' });
      const { accessToken } = await generateTokens(user.id, 'USER');
      
      await request(app)
        .get('/api/v1/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('USER can book appointments', async () => {
      const user = await createTestUser({ role: 'USER' });
      const doctor = await createTestDoctor();
      const { accessToken } = await generateTokens(user.id, 'USER');
      
      await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          doctorId: doctor.id,
          appointmentDate: '2026-03-15',
          appointmentTime: '10:00',
          reason: 'Checkup',
        })
        .expect(201);
    });
  });

  describe('Role-Based Access Control - DOCTOR', () => {
    it('DOCTOR can access doctor routes', async () => {
      const doctor = await createTestDoctor();
      const { accessToken } = await generateTokens(doctor.userId, 'DOCTOR');
      
      await request(app)
        .get('/api/v1/appointments/doctor')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('DOCTOR cannot access admin routes', async () => {
      const doctor = await createTestDoctor();
      const { accessToken } = await generateTokens(doctor.userId, 'DOCTOR');
      
      const res = await request(app)
        .get('/api/v1/admin/stats')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
      
      expect(res.body).toHaveProperty('error');
    });

    it('DOCTOR can update own schedule', async () => {
      const doctor = await createTestDoctor();
      const { accessToken } = await generateTokens(doctor.userId, 'DOCTOR');
      
      await request(app)
        .post(`/api/v1/doctors/${doctor.id}/schedule`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          dayOfWeek: 1,
          startTime: '09:00',
          endTime: '17:00',
        })
        .expect(201);
    });
  });

  describe('Role-Based Access Control - ADMIN', () => {
    it('ADMIN can access admin routes', async () => {
      const admin = await createTestAdmin();
      const { accessToken } = await generateTokens(admin.id, 'ADMIN');
      
      await request(app)
        .get('/api/v1/admin/stats')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('ADMIN can approve doctors', async () => {
      const admin = await createTestAdmin();
      const doctor = await createTestDoctor();
      const { accessToken } = await generateTokens(admin.id, 'ADMIN');
      
      await request(app)
        .put(`/api/v1/doctors/${doctor.id}/verify`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ isVerified: true, isActive: true })
        .expect(200);
    });

    it('ADMIN can reject doctors', async () => {
      const admin = await createTestAdmin();
      const doctor = await createTestDoctor();
      const { accessToken } = await generateTokens(admin.id, 'ADMIN');
      
      await request(app)
        .post(`/api/v1/doctors/${doctor.id}/reject`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });
  });

  describe('Cross-User Access Prevention', () => {
    it('DOCTOR cannot update another doctor profile', async () => {
      const doctor1 = await createTestDoctor();
      const doctor2 = await createTestDoctor();
      const { accessToken } = await generateTokens(doctor1.userId, 'DOCTOR');
      
      const res = await request(app)
        .put(`/api/v1/doctors/${doctor2.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ bio: 'Trying to update' })
        .expect(403);
      
      expect(res.body).toHaveProperty('error');
    });

    it('USER cannot cancel another user appointment', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser({ email: 'user2@test.com' });
      const doctor = await createTestDoctor();
      
      // Create appointment for user1
      const { accessToken: token1 } = await generateTokens(user1.id, 'USER');
      const createRes = await request(app)
        .post('/api/v1/appointments')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          doctorId: doctor.id,
          appointmentDate: '2026-03-15',
          appointmentTime: '10:00',
          reason: 'Checkup',
        });

      // Try to cancel with user2 token
      const { accessToken } = await generateTokens(user2.id, 'USER');
      const res = await request(app)
        .delete(`/api/v1/appointments/${createRes.body.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
      
      expect(res.body).toHaveProperty('error');
    });
  });
});


