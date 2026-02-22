// Medication Tests (MongoDB)
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

describe('Medications - Read Operations (Existing Data)', () => {
  // No beforeEach - tests run against existing MongoDB data
  // No afterEach - read-only operations don't modify data

  afterAll((done) => {
    cleanupTestData().then(() => done());
  });

  describe('GET /api/v1/medications - Get All Medications', () => {
    it('should get all medications without authentication', (done) => {
      request(app)
        .get('/api/v1/medications')
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
        .get('/api/v1/medications?page=1&limit=10')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(Array.isArray(res.body)).toBe(true);
          return done();
        });
    });
  });

  describe('GET /api/v1/medications/search - Search Medications', () => {
    it('should search medications by name', (done) => {
      request(app)
        .get('/api/v1/medications/search?q=aspirin')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(Array.isArray(res.body)).toBe(true);
          return done();
        });
    });

    it('should search medications by category', (done) => {
      request(app)
        .get('/api/v1/medications/search?category=antibiotic')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(Array.isArray(res.body)).toBe(true);
          return done();
        });
    });

    it('should return empty array for no matches', (done) => {
      request(app)
        .get('/api/v1/medications/search?q=nonexistentmedication12345')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(0);
          return done();
        });
    });
  });

  describe('GET /api/v1/medications/:id - Get Medication by ID', () => {
    it('should get medication details by ID', async () => {
      const { accessToken } = await getTestUserToken(app, 'admin');

      // First create a medication
      const createRes = await request(app)
        .post('/api/v1/medications')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Test Medication',
          genericName: 'Test Generic',
          category: 'Antibiotic',
          description: 'Test description',
          dosageForm: 'Tablet',
          strength: '500mg',
          manufacturer: 'Test Pharma',
          sideEffects: ['nausea', 'headache'],
          contraindications: ['pregnancy'],
          interactions: ['alcohol'],
        });

      expect(createRes.status).toBe(201);

      // Then get it by ID
      const res = await request(app)
        .get(`/api/v1/medications/${createRes.body._id}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body).toHaveProperty('name', 'Test Medication');
      expect(res.body).toHaveProperty('category', 'Antibiotic');
    });

    it('should return 404 for non-existent medication', (done) => {
      request(app)
        .get('/api/v1/medications/507f1f77bcf86cd799439011')
        .expect(404)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).toHaveProperty('error');
          return done();
        });
    });
  });

  describe('POST /api/v1/medications - Create Medication (Admin)', () => {
    it('should allow admin to create medication', async () => {
      const { accessToken } = await getTestUserToken(app, 'admin');

      const res = await request(app)
        .post('/api/v1/medications')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Amoxicillin',
          genericName: 'Amoxicillin',
          category: 'Antibiotic',
          description: 'Penicillin antibiotic',
          dosageForm: 'Capsule',
          strength: '500mg',
          manufacturer: 'Generic Pharma',
          sideEffects: ['diarrhea', 'nausea'],
          contraindications: ['penicillin allergy'],
          interactions: ['methotrexate'],
        })
        .expect('Content-Type', /json/)
        .expect(201);

      expect(res.body).toHaveProperty('name', 'Amoxicillin');
      expect(res.body).toHaveProperty('_id');
    });

    it('should reject medication creation by non-admin', async () => {
      const { accessToken } = await getTestUserToken(app, 'user');

      const res = await request(app)
        .post('/api/v1/medications')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Test Med',
          genericName: 'Test',
          category: 'Test',
          description: 'Test',
        })
        .expect(403);

      expect(res.body).toHaveProperty('error');
    });

    it('should reject medication with missing required fields', async () => {
      const { accessToken } = await getTestUserToken(app, 'admin');

      const res = await request(app)
        .post('/api/v1/medications')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Test Med',
          // Missing required fields
        })
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/v1/medications/:id - Update Medication (Admin)', () => {
    it('should allow admin to update medication', async () => {
      const { accessToken } = await getTestUserToken(app, 'admin');

      // Create medication first
      const createRes = await request(app)
        .post('/api/v1/medications')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Original Name',
          genericName: 'Original',
          category: 'Test',
          description: 'Original description',
          dosageForm: 'Tablet',
          strength: '100mg',
          manufacturer: 'Test',
        });

      expect(createRes.status).toBe(201);

      // Update it
      const res = await request(app)
        .put(`/api/v1/medications/${createRes.body._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Updated Name',
          description: 'Updated description',
          strength: '200mg',
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body).toHaveProperty('name', 'Updated Name');
      expect(res.body).toHaveProperty('strength', '200mg');
    });

    it('should reject update by non-admin', async () => {
      const { accessToken } = await getTestUserToken(app, 'user');

      const res = await request(app)
        .put('/api/v1/medications/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Updated' })
        .expect(403);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/v1/medications/:id - Delete Medication (Admin)', () => {
    it('should allow admin to delete medication', async () => {
      const { accessToken } = await getTestUserToken(app, 'admin');

      // Create medication first
      const createRes = await request(app)
        .post('/api/v1/medications')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'To Delete',
          genericName: 'Delete',
          category: 'Test',
          description: 'Will be deleted',
          dosageForm: 'Tablet',
          strength: '100mg',
          manufacturer: 'Test',
        });

      expect(createRes.status).toBe(201);

      // Delete it
      const res = await request(app)
        .delete(`/api/v1/medications/${createRes.body._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('message');
    });

    it('should reject deletion by non-admin', async () => {
      const { accessToken } = await getTestUserToken(app, 'user');

      const res = await request(app)
        .delete('/api/v1/medications/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);

      expect(res.body).toHaveProperty('error');
    });
  });
});
