// Doctor Verification Tests
import request from 'supertest';
import { createServer } from '../src/index';
import { cleanupTestData, createTestUser, createTestAdmin, generateTokens } from './helpers/testHelpers';
import { validDoctor } from './fixtures/users';
import { PrismaClient } from '@prisma/client';

const app = createServer();
const prisma = new PrismaClient();

describe('Doctor Verification', () => {
  // Removed beforeEach cleanup to prevent foreign key constraint errors
  // Tests use unique emails with timestamps to avoid conflicts

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('POST /api/v1/doctors/register - New User', () => {
    it('should allow new user to register as doctor', async () => {
      const uniqueDoctor = { ...validDoctor, email: `doctor-${Date.now()}@example.com` };
      const response = await request(app)
        .post('/api/v1/doctors/register')
        .send(uniqueDoctor)
        .expect(201);

      expect(response.body).toHaveProperty('specialty', validDoctor.specialty);
      expect(response.body).not.toHaveProperty('licenseNumberHash');
    });

    it('should create doctor with isVerified=false and isActive=false', async () => {
      const uniqueDoctor = { ...validDoctor, email: `doctor-${Date.now()}@example.com` };
      const response = await request(app)
        .post('/api/v1/doctors/register')
        .send(uniqueDoctor)
        .expect(201);

      const doctor = await prisma.doctor.findUnique({
        where: { id: response.body.id },
      });

      expect(doctor?.isVerified).toBe(false);
      expect(doctor?.isActive).toBe(false);
    });

    it('should encrypt license number', async () => {
      const uniqueDoctor = { ...validDoctor, email: `doctor-${Date.now()}@example.com` };
      const response = await request(app)
        .post('/api/v1/doctors/register')
        .send(uniqueDoctor)
        .expect(201);

      const doctor = await prisma.doctor.findUnique({
        where: { id: response.body.id },
      });

      expect(doctor?.licenseNumberHash).toBeDefined();
      expect(doctor?.licenseNumberHash).not.toBe(validDoctor.licenseNumber);
    });

    it('should change user role to DOCTOR', async () => {
      const uniqueDoctor = { ...validDoctor, email: `doctor-${Date.now()}@example.com` };
      const response = await request(app)
        .post('/api/v1/doctors/register')
        .send(uniqueDoctor)
        .expect(201);

      const user = await prisma.user.findUnique({
        where: { id: response.body.userId },
      });

      expect(user?.role).toBe('DOCTOR');
    });

    it('should save schedule if provided', async () => {
      const uniqueDoctor = { ...validDoctor, email: `doctor-${Date.now()}@example.com` };
      const response = await request(app)
        .post('/api/v1/doctors/register')
        .send({
          ...uniqueDoctor,
          schedules: [
            { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
            { dayOfWeek: 3, startTime: '10:00', endTime: '18:00' },
          ],
        })
        .expect(201);

      const schedules = await prisma.doctorSchedule.findMany({
        where: { doctorId: response.body.id },
      });

      expect(schedules).toHaveLength(2);
    });

    it('should reject duplicate email', async () => {
      const uniqueDoctor = { ...validDoctor, email: `doctor-${Date.now()}@example.com` };
      await request(app).post('/api/v1/doctors/register').send(uniqueDoctor);

      const response = await request(app)
        .post('/api/v1/doctors/register')
        .send(uniqueDoctor)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/doctors/register')
        .send({
          email: validDoctor.email,
          password: validDoctor.password,
          // Missing other required fields
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/doctors/register - Existing User', () => {
    it('should allow existing user to apply as doctor', async () => {
      const user = await createTestUser({ email: `existing-${Date.now()}@test.com` });
      const { accessToken } = await generateTokens(user.id, 'USER');

      const response = await request(app)
        .post('/api/v1/doctors/register')
        .send({
          email: user.email,
          specialty: validDoctor.specialty,
          licenseNumber: validDoctor.licenseNumber,
          education: validDoctor.education,
          phone: validDoctor.phone,
          address: validDoctor.address,
          city: validDoctor.city,
          country: validDoctor.country,
        })
        .expect(201);

      expect(response.body).toHaveProperty('userId', user.id);
    });

    it('should reject if user already has doctor profile', async () => {
      const user = await createTestUser({ email: `existing-${Date.now()}@test.com` });

      // First application
      await request(app)
        .post('/api/v1/doctors/register')
        .send({
          email: user.email,
          specialty: validDoctor.specialty,
          licenseNumber: validDoctor.licenseNumber,
          education: validDoctor.education,
          phone: validDoctor.phone,
          address: validDoctor.address,
          city: validDoctor.city,
          country: validDoctor.country,
        });

      // Second application - should fail
      const response = await request(app)
        .post('/api/v1/doctors/register')
        .send({
          email: user.email,
          specialty: 'Cardiology',
          licenseNumber: 'NEW123',
          education: validDoctor.education,
          phone: validDoctor.phone,
          address: validDoctor.address,
          city: validDoctor.city,
          country: validDoctor.country,
        })
        .expect(400);

      expect(response.body.error).toContain('already have');
    });
  });

  describe('PUT /api/v1/doctors/:id/verify - Admin Approval', () => {
    it('should allow admin to approve doctor', async () => {
      const admin = await createTestAdmin();
      const { accessToken } = await generateTokens(admin.id, 'ADMIN');

      const uniqueDoctor = { ...validDoctor, email: `doctor-${Date.now()}@example.com` };
      const doctorResponse = await request(app)
        .post('/api/v1/doctors/register')
        .send(uniqueDoctor);

      const response = await request(app)
        .put(`/api/v1/doctors/${doctorResponse.body.id}/verify`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ isVerified: true, isActive: true })
        .expect(200);

      expect(response.body.isVerified).toBe(true);
      expect(response.body.isActive).toBe(true);
    });

    it('should reject non-admin approval', async () => {
      const user = await createTestUser();
      const { accessToken } = await generateTokens(user.id, 'USER');

      const uniqueDoctor = { ...validDoctor, email: `doctor-${Date.now()}@example.com` };
      const doctorResponse = await request(app)
        .post('/api/v1/doctors/register')
        .send(uniqueDoctor);

      await request(app)
        .put(`/api/v1/doctors/${doctorResponse.body.id}/verify`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ isVerified: true, isActive: true })
        .expect(403);
    });
  });

  describe('POST /api/v1/doctors/:id/reject - Admin Rejection', () => {
    it('should allow admin to reject doctor', async () => {
      const admin = await createTestAdmin();
      const { accessToken } = await generateTokens(admin.id, 'ADMIN');

      const doctorResponse = await request(app)
        .post('/api/v1/doctors/register')
        .send(validDoctor);

      await request(app)
        .post(`/api/v1/doctors/${doctorResponse.body.id}/reject`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Verify doctor profile is deleted
      const doctor = await prisma.doctor.findUnique({
        where: { id: doctorResponse.body.id },
      });

      expect(doctor).toBeNull();
    });

    it('should change user role back to USER after rejection', async () => {
      const admin = await createTestAdmin();
      const { accessToken } = await generateTokens(admin.id, 'ADMIN');

      const doctorResponse = await request(app)
        .post('/api/v1/doctors/register')
        .send(validDoctor);

      await request(app)
        .post(`/api/v1/doctors/${doctorResponse.body.id}/reject`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const user = await prisma.user.findUnique({
        where: { id: doctorResponse.body.userId },
      });

      expect(user?.role).toBe('USER');
    });

    it('should allow rejected doctor to reapply', async () => {
      const admin = await createTestAdmin();
      const { accessToken } = await generateTokens(admin.id, 'ADMIN');

      // First application with unique email
      const firstEmail = `doctor-first-${Date.now()}@example.com`;
      const firstResponse = await request(app)
        .post('/api/v1/doctors/register')
        .send({ ...validDoctor, email: firstEmail });

      // Reject
      await request(app)
        .post(`/api/v1/doctors/${firstResponse.body.id}/reject`)
        .set('Authorization', `Bearer ${accessToken}`);

      // Reapply with same email (should work since doctor was deleted)
      const secondResponse = await request(app)
        .post('/api/v1/doctors/register')
        .send({ ...validDoctor, email: firstEmail })
        .expect(201);

      expect(secondResponse.body).toBeDefined();
    });
  });

  describe('GET /api/v1/doctors - Public Search', () => {
    it('should only show verified doctors by default', async () => {
      const admin = await createTestAdmin();
      const { accessToken } = await generateTokens(admin.id, 'ADMIN');

      // Create unverified doctor with unique email
      const unverifiedEmail = `unverified-${Date.now()}@test.com`;
      await request(app).post('/api/v1/doctors/register').send({ ...validDoctor, email: unverifiedEmail });

      // Create verified doctor with unique email
      const verifiedEmail = `verified-${Date.now()}@test.com`;
      const doctor2Response = await request(app)
        .post('/api/v1/doctors/register')
        .send({ ...validDoctor, email: verifiedEmail });

      await request(app)
        .put(`/api/v1/doctors/${doctor2Response.body.id}/verify`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ isVerified: true, isActive: true });

      // Public search - should only return the verified doctor
      const response = await request(app).get('/api/v1/doctors').expect(200);

      // Filter to only doctors created in this test
      const testDoctors = response.body.filter((d: any) => 
        d.user.email === unverifiedEmail || d.user.email === verifiedEmail
      );

      expect(testDoctors).toHaveLength(1);
      expect(testDoctors[0].isVerified).toBe(true);
      expect(testDoctors[0].user.email).toBe(verifiedEmail);
    });

    it('should show all doctors when includeUnverified=true', async () => {
      await request(app).post('/api/v1/doctors/register').send(validDoctor);
      await request(app)
        .post('/api/v1/doctors/register')
        .send({ ...validDoctor, email: 'doctor2@test.com' });

      const response = await request(app)
        .get('/api/v1/doctors?includeUnverified=true')
        .expect(200);

      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });

    it('should never return licenseNumberHash', async () => {
      const admin = await createTestAdmin();
      const { accessToken } = await generateTokens(admin.id, 'ADMIN');

      const doctorResponse = await request(app)
        .post('/api/v1/doctors/register')
        .send(validDoctor);

      await request(app)
        .put(`/api/v1/doctors/${doctorResponse.body.id}/verify`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ isVerified: true, isActive: true });

      const response = await request(app).get('/api/v1/doctors').expect(200);

      response.body.forEach((doctor: any) => {
        expect(doctor).not.toHaveProperty('licenseNumberHash');
      });
    });
  });
});


