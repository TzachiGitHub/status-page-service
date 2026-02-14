import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../index.js';

describe('Auth API', () => {
  let token: string;

  it('POST /api/auth/register — creates org and user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      orgName: 'Test Corp',
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('OWNER');
    expect(res.body.organization.name).toBe('Test Corp');
    token = res.body.token;
  });

  it('POST /api/auth/login — returns JWT', async () => {
    // Register first
    const email = `login-${Date.now()}@example.com`;
    await request(app).post('/api/auth/register').send({
      orgName: 'Login Corp',
      name: 'Login User',
      email,
      password: 'password123',
    });

    const res = await request(app).post('/api/auth/login').send({
      email,
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('POST /api/auth/login — rejects invalid password', async () => {
    const email = `bad-${Date.now()}@example.com`;
    await request(app).post('/api/auth/register').send({
      orgName: 'Bad Corp',
      name: 'Bad User',
      email,
      password: 'password123',
    });

    const res = await request(app).post('/api/auth/login').send({
      email,
      password: 'wrongpassword',
    });

    expect(res.status).toBe(401);
  });

  it('GET /api/auth/me — returns user info', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.organization).toBeDefined();
  });

  it('GET /api/auth/me — rejects without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
