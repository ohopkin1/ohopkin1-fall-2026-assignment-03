import { db, TimeLog, NewTimeLog } from '../db/database.js';
import { sql } from 'kysely';

export async function insertTimeLog(
  ticketId: number,
  userId: number,
  hours: number,
): Promise<TimeLog> {
  const timeLog: NewTimeLog = {
    ticket_id: ticketId,
    user_id: userId,
    hours,
  };

  return await db
    .insertInto('time_logs')
    .values(timeLog)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function getTotalHoursForTicket(
  ticketId: number,
): Promise<number> {
  const result = await db
    .selectFrom('time_logs')
    .select(
      sql<number>`COALESCE(SUM(hours), 0)`.as('total_hours'),
    )
    .where('ticket_id', '=', ticketId)
    .executeTakeFirstOrThrow();

  return Number(result.total_hours);
}

