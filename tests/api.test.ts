import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

describe('Part 1: API Integration Tests', () => {
  it('creates a user', async () => {
    const response = await request(app)
      .post('/users')
      .send({
        name: 'Alice',
        email: 'alice@example.com',
      });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Alice');
    expect(response.body.email).toBe('alice@example.com');
  });

  it('rejects creating a ticket without X-User-Id', async () => {
    const response = await request(app)
      .post('/tickets')
      .send({
        title: 'Test ticket',
        description: 'Testing auth',
      });

    expect(response.status).toBe(401);
  });

  it('creates a ticket with X-User-Id', async () => {
    const user = await request(app)
      .post('/users')
      .send({
        name: 'Bob',
        email: 'bob@example.com',
      });

    const response = await request(app)
      .post('/tickets')
      .set('X-User-Id', String(user.body.id))
      .send({
        title: 'Test ticket',
        description: 'Testing tickets',
      });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe('Test ticket');
    expect(response.body.creator_id).toBe(user.body.id);
  });

  it('returns 404 for a missing user', async () => {
    const response = await request(app)
      .get('/users/99999');

    expect(response.status).toBe(404);
  });

  it('returns 404 for a missing ticket', async () => {
    const response = await request(app)
      .get('/tickets/99999');

    expect(response.status).toBe(404);
  });

  it('supports ticket pagination', async () => {
    const user = await request(app)
      .post('/users')
      .send({
        name: 'Owen',
        email: 'ohopkin1@gmail.com',
      });

    for (let i = 0; i < 3; i++) {
      await request(app)
        .post('/tickets')
        .set('X-User-Id', String(user.body.id))
        .send({
          title: `Ticket ${i}`,
          description: 'Test',
        });
    }

    const response = await request(app)
      .get('/tickets')
      .query({
        limit: 2,
        offset: 1,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });
});

