// User Profile Tests
import request from 'supertest';
import { createServer } from '../src/index';
import { cleanupTestData, createTestUser, generateTokens } from './helpers/testHelpers';
import { PrismaClient } from '@prisma/client';

const app = createServer();
const prisma = new PrismaClient();

describe('User Profile', () => {
  // Removed beforeEach cleanup to prevent foreign key constraint errors
  // Tests use unique emails with timestamps to avoid conflicts

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('GET /api/v1/profile - Get User Profile', () => {
    it('should get authenticated user profile', async () => {
      const user = await createTestUser();
      const { accessToken } = await generateTokens(user.id, 'USER');
      
      const res = await request(app)
        .get('/api/v1/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(res.body).toHaveProperty('email', user.email);
      expect(res.body).toHaveProperty('firstName', user.firstName);
      expect(res.body).not.toHaveProperty('passwordHash');
    });

    it('should reject unauthenticated request', (done) => {
      request(app)
        .get('/api/v1/profile')
        .expect(401)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).toHaveProperty('error');
          return done();
        });
    });

    it('should include profile data if exists', async () => {
      const user = await createTestUser();
      
      await prisma.userProfile.create({
        data: {
          userId: user.id,
          dateOfBirth: new Date('1990-01-01'),
          gender: 'MALE',
          bloodType: 'O+',
          height: 180,
          weight: 75,
        },
      });
      
      const { accessToken } = await generateTokens(user.id, 'USER');
      
      const res = await request(app)
        .get('/api/v1/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      
      expect(res.body).toHaveProperty('profile');
      expect(res.body.profile).toHaveProperty('bloodType', 'O+');
    });
  });

  describe('PUT /api/v1/profile - Update User Profile', () => {
    it('should update user basic information', async () => {
      const user = await createTestUser();
      const { accessToken } = await generateTokens(user.id, 'USER');
      
      const res = await request(app)
        .put('/api/v1/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name',
          phone: '+1234567890',
        })
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(res.body).toHaveProperty('firstName', 'Updated');
      expect(res.body).toHaveProperty('lastName', 'Name');
    });

    it('should create or update profile data', async () => {
      const user = await createTestUser();
      const { accessToken } = await generateTokens(user.id, 'USER');
      
      const res = await request(app)
        .put('/api/v1/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          dateOfBirth: '1990-01-01',
          gender: 'MALE',
          bloodType: 'A+',
          height: 175,
          weight: 70,
        })
        .expect(200);
      
      expect(res.body).toHaveProperty('profile');
      expect(res.body.profile).toHaveProperty('bloodType', 'A+');
    });

    it('should reject invalid email format', async () => {
      const user = await createTestUser();
      const { accessToken } = await generateTokens(user.id, 'USER');
      
      const res = await request(app)
        .put('/api/v1/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: 'invalid-email',
        })
        .expect(400);
      
      expect(res.body).toHaveProperty('error');
    });

    it('should reject invalid blood type', async () => {
      const user = await createTestUser();
      const { accessToken } = await generateTokens(user.id, 'USER');
      
      const res = await request(app)
        .put('/api/v1/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          bloodType: 'INVALID',
        })
        .expect(400);
      
      expect(res.body).toHaveProperty('error');
    });

    it('should reject negative height or weight', async () => {
      const user = await createTestUser();
      const { accessToken } = await generateTokens(user.id, 'USER');
      
      const res = await request(app)
        .put('/api/v1/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          height: -10,
          weight: -5,
        })
        .expect(400);
      
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/v1/profile/password - Change Password', () => {
    it('should allow user to change password', async () => {
      const user = await createTestUser();
      const { accessToken } = await generateTokens(user.id, 'USER');
      
      const res = await request(app)
        .put('/api/v1/profile/password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'Test123!@#',
          newPassword: 'NewPass123!@#',
        })
        .expect(200);
      
      expect(res.body).toHaveProperty('message');
    });

    it('should reject wrong current password', async () => {
      const user = await createTestUser();
      const { accessToken } = await generateTokens(user.id, 'USER');
      
      const res = await request(app)
        .put('/api/v1/profile/password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'WrongPassword',
          newPassword: 'NewPass123!@#',
        })
        .expect(401);
      
      expect(res.body).toHaveProperty('error');
    });

    it('should reject weak new password', async () => {
      const user = await createTestUser();
      const { accessToken } = await generateTokens(user.id, 'USER');
      
      const res = await request(app)
        .put('/api/v1/profile/password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'Test123!@#',
          newPassword: '123',
        })
        .expect(400);
      
      expect(res.body).toHaveProperty('error');
    });
  });
});

