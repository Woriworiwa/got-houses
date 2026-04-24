import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from './app.js';
import { userStore } from './user.store.js';

beforeEach(() => userStore.clear());

describe('POST /auth/register', () => {
  it('creates a user and returns a token', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'jon@wall.com', password: 'ghost123', name: 'Jon Snow' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toMatchObject({ email: 'jon@wall.com', name: 'Jon Snow' });
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('returns 409 when email is already taken', async () => {
    await request(app)
      .post('/auth/register')
      .send({ email: 'jon@wall.com', password: 'ghost123', name: 'Jon Snow' });

    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'jon@wall.com', password: 'ghost123', name: 'Jon Snow' });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('Email already in use');
  });

  it('returns 400 when fields are missing', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'jon@wall.com' });

    expect(res.status).toBe(400);
  });
});

describe('POST /auth/login', () => {
  beforeEach(async () => {
    await request(app)
      .post('/auth/register')
      .send({ email: 'arya@stark.com', password: 'needle99', name: 'Arya Stark' });
  });

  it('returns a token on valid credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'arya@stark.com', password: 'needle99' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toMatchObject({ email: 'arya@stark.com' });
  });

  it('returns 401 on wrong password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'arya@stark.com', password: 'wrong' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('returns 401 for unknown email', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'nobody@example.com', password: 'whatever' });

    expect(res.status).toBe(401);
  });

  it('returns 400 when fields are missing', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'arya@stark.com' });

    expect(res.status).toBe(400);
  });
});

describe('GET /auth/me', () => {
  let token: string;

  beforeEach(async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'sansa@stark.com', password: 'lemoncake1', name: 'Sansa Stark' });
    token = res.body.token;
  });

  it('returns the current user for a valid token', async () => {
    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ email: 'sansa@stark.com', name: 'Sansa Stark' });
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('returns 401 with no token', async () => {
    const res = await request(app).get('/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 with an invalid token', async () => {
    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', 'Bearer this.is.invalid');

    expect(res.status).toBe(401);
  });
});
