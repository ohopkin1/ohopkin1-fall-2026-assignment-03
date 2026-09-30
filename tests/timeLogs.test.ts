import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

describe('Part 2: Time Logs Tests', () => {
  it('should calculate total hours for a ticket', async () => {
    const userResponse = await request(app)
      .post('/users')
      .send({
        name: 'Developer',
        email: 'developer@example.com',
      });

    expect(userResponse.status).toBe(201);

    const userId = userResponse.body.id;

    const ticketResponse = await request(app)
      .post('/tickets')
      .set('X-User-Id', String(userId))
      .send({
        title: 'Time tracking ticket',
        description: 'Testing time logs',
      });

    expect(ticketResponse.status).toBe(201);

    const ticketId = ticketResponse.body.id;

    const firstLog = await request(app)
      .post(`/tickets/${ticketId}/time`)
      .set('X-User-Id', String(userId))
      .send({
        hours: 2,
      });

    expect(firstLog.status).toBe(201);

    const secondLog = await request(app)
      .post(`/tickets/${ticketId}/time`)
      .set('X-User-Id', String(userId))
      .send({
        hours: 3.5,
      });

    expect(secondLog.status).toBe(201);

    const totalResponse = await request(app)
      .get(`/tickets/${ticketId}/time`);

    expect(totalResponse.status).toBe(200);
    expect(totalResponse.body).toEqual({
      ticket_id: ticketId,
      total_hours: 5.5,
    });
  });
});

