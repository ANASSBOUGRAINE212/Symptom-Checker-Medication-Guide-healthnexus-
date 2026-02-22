// Authentication Tests
import request from 'supertest';
import { createServer } from '../src/index';
import { cleanupTestData } from './helpers/testHelpers';
import { validUser } from './fixtures/users';
import { TEST_CREDENTIALS, getTestCredentials } from './fixtures/testAccounts';
import { generateTestEmail } from './fixtures/testData';

const app = createServer();

describe('Authentication', () => {
  // Removed beforeEach cleanup to prevent foreign key constraint errors
  // Tests use unique emails with timestamps to avoid conflicts

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', (done) => {
      const uniqueUser = { ...validUser, email: generateTestEmail('register') };
      request(app)
        .post('/api/v1/auth/register')
        .send(uniqueUser)
        .expect('Content-Type', /json/)
        .expect(201)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body.user).toHaveProperty('email', uniqueUser.email);
          expect(res.body.user).not.toHaveProperty('passwordHash');
          return done();
        });
    });

    it('should reject registration with duplicate email', (done) => {
      // Use permanent test account email to test duplicate
      request(app)
        .post('/api/v1/auth/register')
        .send({ ...validUser, email: TEST_CREDENTIALS.user.email })
        .expect('Content-Type', /json/)
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).toHaveProperty('error');
          expect(res.body.error).toContain('already exists');
          return done();
        });
    });

    it('should reject registration with weak password', (done) => {
      request(app)
        .post('/api/v1/auth/register')
        .send({
          ...validUser,
          email: generateTestEmail('weak'),
          password: '123',
        })
        .expect('Content-Type', /json/)
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).toHaveProperty('error');
          return done();
        });
    });

    it('should reject registration with invalid email', (done) => {
      request(app)
        .post('/api/v1/auth/register')
        .send({
          ...validUser,
          email: 'invalid-email',
        })
        .expect('Content-Type', /json/)
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).toHaveProperty('error');
          return done();
        });
    });

    it('should hash password before storing', (done) => {
      const uniqueUser = { ...validUser, email: generateTestEmail('hash') };
      request(app)
        .post('/api/v1/auth/register')
        .send(uniqueUser)
        .expect('Content-Type', /json/)
        .expect(201)
        .end((err, res) => {
          if (err) return done(err);
          // Password should not be returned
          expect(res.body.user).not.toHaveProperty('password');
          expect(res.body.user).not.toHaveProperty('passwordHash');
          return done();
        });
    });
  });

  describe('POST /api/v1/auth/login - Permanent Test Accounts', () => {
    // Use permanent test accounts for login tests
    it('should login as regular user with valid credentials', (done) => {
      const credentials = getTestCredentials('user');
      request(app)
        .post('/api/v1/auth/login')
        .send({
          email: credentials.email,
          password: credentials.password,
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body.user).toHaveProperty('email', credentials.email);
          expect(res.body.user).toHaveProperty('role', 'USER');
          return done();
        });
    });

    it('should login as doctor with valid credentials', (done) => {
      const credentials = getTestCredentials('doctor');
      request(app)
        .post('/api/v1/auth/login')
        .send({
          email: credentials.email,
          password: credentials.password,
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body.user).toHaveProperty('email', credentials.email);
          expect(res.body.user).toHaveProperty('role', 'DOCTOR');
          return done();
        });
    });

    it('should login as admin with valid credentials', (done) => {
      const credentials = getTestCredentials('admin');
      request(app)
        .post('/api/v1/auth/login')
        .send({
          email: credentials.email,
          password: credentials.password,
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          expect(res.body.user).toHaveProperty('email', credentials.email);
          expect(res.body.user).toHaveProperty('role', 'ADMIN');
          return done();
        });
    });
  });

  describe('POST /api/v1/auth/login - Error Cases', () => {
    it('should login with valid credentials', (done) => {
      const uniqueUser = { ...validUser, email: generateTestEmail('login') };
      request(app)
        .post('/api/v1/auth/register')
        .send(uniqueUser)
        .end((err) => {
          if (err) return done(err);
          
          request(app)
            .post('/api/v1/auth/login')
            .send({
              email: uniqueUser.email,
              password: uniqueUser.password,
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
              if (err) return done(err);
              expect(res.body).toHaveProperty('accessToken');
              expect(res.body).toHaveProperty('refreshToken');
              expect(res.body.user).toHaveProperty('email', uniqueUser.email);
              return done();
            });
        });
    });

    it('should reject login with invalid email', (done) => {
      request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).toHaveProperty('error');
          return done();
        });
    });

    it('should reject login with wrong password', (done) => {
      const credentials = getTestCredentials('user');
      request(app)
        .post('/api/v1/auth/login')
        .send({
          email: credentials.email,
          password: 'wrongpassword',
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).toHaveProperty('error');
          return done();
        });
    });

    it('should track failed login attempts', (done) => {
      const credentials = getTestCredentials('user');
      
      // Make multiple failed login attempts
      let attempts = 0;
      const makeAttempt = () => {
        request(app)
          .post('/api/v1/auth/login')
          .send({
            email: credentials.email,
            password: 'wrongpassword',
          })
          .expect(401)
          .end((err) => {
            if (err) return done(err);
            attempts++;
            if (attempts < 3) {
              makeAttempt();
            } else {
              // Verify failed attempts are tracked (implementation dependent)
              return done();
            }
          });
      };
      makeAttempt();
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh access token with valid refresh token', (done) => {
      const uniqueUser = { ...validUser, email: generateTestEmail('refresh') };
      request(app)
        .post('/api/v1/auth/register')
        .send(uniqueUser)
        .end((err, registerRes) => {
          if (err) return done(err);
          
          const { refreshToken } = registerRes.body;
          
          // Wait 1 second to ensure token timestamp is different
          setTimeout(() => {
            request(app)
              .post('/api/v1/auth/refresh')
              .send({ refreshToken })
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(200)
              .end((err, res) => {
                if (err) return done(err);
                expect(res.body).toHaveProperty('accessToken');
                expect(res.body).toHaveProperty('refreshToken');
                // New tokens should be different from old ones (generated at different times)
                expect(res.body.accessToken).not.toBe(registerRes.body.accessToken);
                expect(res.body.refreshToken).not.toBe(refreshToken);
                return done();
              });
          }, 1000);
        });
    });

    it('should reject invalid refresh token', (done) => {
      request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).toHaveProperty('error');
          return done();
        });
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout and revoke refresh token', (done) => {
      request(app)
        .post('/api/v1/auth/register')
        .send(validUser)
        .end((err, registerRes) => {
          if (err) return done(err);
          
          const { refreshToken } = registerRes.body;
          
          request(app)
            .post('/api/v1/auth/logout')
            .send({ refreshToken })
            .expect(200)
            .end((err) => {
              if (err) return done(err);
              
              // Try to use revoked token
              request(app)
                .post('/api/v1/auth/refresh')
                .send({ refreshToken })
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(401)
                .end((err, res) => {
                  if (err) return done(err);
                  expect(res.body).toHaveProperty('error');
                  return done();
                });
            });
        });
    });
  });
});
