import { Router, Request, Response } from 'express';
import {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicketStatus,
} from '../dal/tickets.js';
import authMiddleware from '../middleware/auth.js';
import {
  insertTimeLog,
  getTotalHoursForTicket,
} from '../dal/timeLogs.js';

const router = Router();

// GET /tickets
router.get('/', async (req: Request, res: Response) => {
  const limit =
    req.query.limit !== undefined
      ? Number(req.query.limit)
      : undefined;

  const offset =
    req.query.offset !== undefined
      ? Number(req.query.offset)
      : undefined;

  const status =
    typeof req.query.status === 'string'
      ? req.query.status
      : undefined;

  const tickets = await getAllTickets({
    limit,
    offset,
    status,
  });

  res.status(200).json(tickets);
});

// GET /tickets/:id/time
router.get('/:id/time', async (req: Request, res: Response) => {
  const ticketId = Number(req.params.id);

  if (!Number.isInteger(ticketId)) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  const ticket = await getTicketById(ticketId);

  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  const totalHours = await getTotalHoursForTicket(ticketId);

  res.status(200).json({
    ticket_id: ticketId,
    total_hours: totalHours,
  });
});

// GET /tickets/:id
router.get('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  const ticket = await getTicketById(id);

  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  res.status(200).json(ticket);
});

// POST /tickets
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  const { title, description } = req.body;
  const userId = res.locals.userId as number;

  if (typeof title !== 'string') {
    res.status(400).json({ error: 'title is required' });
    return;
  }

  const ticket = await createTicket({
    title,
    description: description ?? null,
    creator_id: userId,
  });

  res.status(201).json(ticket);
});

// POST /tickets/:id/time
router.post(
  '/:id/time',
  authMiddleware,
  async (req: Request, res: Response) => {
    const ticketId = Number(req.params.id);
    const userId = res.locals.userId as number;
    const { hours } = req.body;

    if (!Number.isInteger(ticketId)) {
      res.status(400).json({ error: 'Invalid ticket ID' });
      return;
    }

    if (typeof hours !== 'number' || hours <= 0) {
      res.status(400).json({
        error: 'hours must be a positive number',
      });
      return;
    }

    const ticket = await getTicketById(ticketId);

    if (!ticket) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    const timeLog = await insertTimeLog(
      ticketId,
      userId,
      hours,
    );

    res.status(201).json(timeLog);
  },
);

// PATCH /tickets/:id/status
router.patch(
  '/:id/status',
  authMiddleware,
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(id) || typeof status !== 'string') {
      res.status(400).json({ error: 'Invalid request' });
      return;
    }

    const ticket = await updateTicketStatus(id, status);

    if (!ticket) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    res.status(200).json(ticket);
  },
);

export default router;

