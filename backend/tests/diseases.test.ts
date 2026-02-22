// Disease Tests (MongoDB)
// 
// HYBRID APPROACH:
// - READ operations (GET, Search) test against existing MongoDB data
// - No setup/cleanup needed for read-only tests
// - Tests verify behavior, not specific data counts
// - WRITE operations (POST, PUT, DELETE) use permanent test accounts
//
import request from 'supertest';
import { createServer } from '../src/index';
import { cleanupTestData } from './helpers/testHelpers';
import { getTestUserToken } from './fixtures/testAccounts';

const app = createServer();

describe('Diseases - Read Operations (Existing Data)', () => {
  // No beforeEach - tests run against existing MongoDB data
  // No afterEach - read-only operations don't modify data

  afterAll((done) => {
    cleanupTestData().then(() => done());
  });

  describe('GET /api/v1/diseases - Get All Diseases', () => {
    it('should get all diseases without authentication', (done) => {
      request(app)
        .get('/api/v1/diseases')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(Array.isArray(res.body)).toBe(true);
          return done();
        });
    });

    it('should support pagination', (done) => {
      request(app)
        .get('/api/v1/diseases?page=1&limit=10')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(Array.isArray(res.body)).toBe(true);
          return done();
        });
    });
  });

  describe('GET /api/v1/diseases/search - Search Diseases', () => {
    it('should search diseases by name', (done) => {
      request(app)
        .get('/api/v1/diseases/search?q=diabetes')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(Array.isArray(res.body)).toBe(true);
          return done();
        });
    });

    it('should search diseases by category', (done) => {
      request(app)
        .get('/api/v1/diseases/search?category=cardiovascular')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(Array.isArray(res.body)).toBe(true);
          return done();
        });
    });

    it('should return empty array for no matches', (done) => {
      request(app)
        .get('/api/v1/diseases/search?q=nonexistentdisease12345')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(0);
          return done();
        });
    });
  });

  describe('GET /api/v1/diseases/:id - Get Disease by ID', () => {
    it('should get disease details by ID', async () => {
      const { accessToken } = await getTestUserToken(app, 'admin');

      // First create a disease
      const createRes = await request(app)
        .post('/api/v1/diseases')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Test Disease',
          category: 'Infectious',
          severity: 'Moderate',
          definition: 'Test description',
          symptoms: ['fever', 'cough'],
          causes: ['virus'],
          treatments: ['rest', 'medication'],
          prevention: ['hygiene'],
        });

      expect(createRes.status).toBe(201);

      // Then get it by ID
      const res = await request(app)
        .get(`/api/v1/diseases/${createRes.body._id}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body).toHaveProperty('name', 'Test Disease');
      expect(res.body).toHaveProperty('category', 'Infectious');
    });

    it('should return 404 for non-existent disease', (done) => {
      request(app)
        .get('/api/v1/diseases/507f1f77bcf86cd799439011')
        .expect(404)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).toHaveProperty('error');
          return done();
        });
    });
  });

  describe('POST /api/v1/diseases - Create Disease (Admin)', () => {
    it('should allow admin to create disease', async () => {
      const { accessToken } = await getTestUserToken(app, 'admin');

      const res = await request(app)
        .post('/api/v1/diseases')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Hypertension',
          category: 'Cardiovascular',
          severity: 'Moderate',
          definition: 'High blood pressure',
          symptoms: ['headache', 'dizziness'],
          causes: ['stress', 'diet'],
          treatments: ['medication', 'lifestyle changes'],
          prevention: ['exercise', 'healthy diet'],
        })
        .expect('Content-Type', /json/)
        .expect(201);

      expect(res.body).toHaveProperty('name', 'Hypertension');
      expect(res.body).toHaveProperty('_id');
    });

    it('should reject disease creation by non-admin', async () => {
      const { accessToken } = await getTestUserToken(app, 'user');

      const res = await request(app)
        .post('/api/v1/diseases')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Test Disease',
          category: 'Test',
          severity: 'Mild',
          definition: 'Test',
        })
        .expect(403);

      expect(res.body).toHaveProperty('error');
    });

    it('should reject disease with missing required fields', async () => {
      const { accessToken } = await getTestUserToken(app, 'admin');

      const res = await request(app)
        .post('/api/v1/diseases')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Test Disease',
          // Missing category and description
        })
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/v1/diseases/:id - Update Disease (Admin)', () => {
    it('should allow admin to update disease', async () => {
      const { accessToken } = await getTestUserToken(app, 'admin');

      // Create disease first
      const createRes = await request(app)
        .post('/api/v1/diseases')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Original Name',
          category: 'Test',
          severity: 'Mild',
          definition: 'Original description',
        });

      expect(createRes.status).toBe(201);

      // Update it
      const res = await request(app)
        .put(`/api/v1/diseases/${createRes.body._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Updated Name',
          definition: 'Updated description',
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body).toHaveProperty('name', 'Updated Name');
      expect(res.body).toHaveProperty('definition', 'Updated description');
    });

    it('should reject update by non-admin', async () => {
      const { accessToken } = await getTestUserToken(app, 'user');

      const res = await request(app)
        .put('/api/v1/diseases/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Updated' })
        .expect(403);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/v1/diseases/:id - Delete Disease (Admin)', () => {
    it('should allow admin to delete disease', async () => {
      const { accessToken } = await getTestUserToken(app, 'admin');

      // Create disease first
      const createRes = await request(app)
        .post('/api/v1/diseases')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'To Delete',
          category: 'Test',
          severity: 'Mild',
          definition: 'Will be deleted',
        });

      expect(createRes.status).toBe(201);

      // Delete it
      const res = await request(app)
        .delete(`/api/v1/diseases/${createRes.body._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('message');
    });

    it('should reject deletion by non-admin', async () => {
      const { accessToken } = await getTestUserToken(app, 'user');

      const res = await request(app)
        .delete('/api/v1/diseases/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);

      expect(res.body).toHaveProperty('error');
    });
  });
});
