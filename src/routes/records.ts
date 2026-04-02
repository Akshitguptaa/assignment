import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createRecordSchema, updateRecordSchema, recordFilterSchema } from '../validators/schemas';

const router = Router();

router.use(authenticate);

// List records with filtering — ANALYST + ADMIN
router.get('/', requireRole('ANALYST', 'ADMIN'), validate(recordFilterSchema, 'query'), async (req, res) => {
  const { type, category, from, to, page, limit } = req.query as {
    type?: 'INCOME' | 'EXPENSE';
    category?: string;
    from?: string;
    to?: string;
    page: string;
    limit: string;
  };

  const pageNum = parseInt(page ?? '1');
  const limitNum = parseInt(limit ?? '20');

  const where = {
    ...(type ? { type } : {}),
    ...(category ? { category: { contains: category, mode: 'insensitive' as const } } : {}),
    ...(from || to
      ? {
          date: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {}),
  };

  const [records, total] = await Promise.all([
    prisma.financialRecord.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.financialRecord.count({ where }),
  ]);

  res.json({
    data: records,
    meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
  });
});

// Get single record — ANALYST + ADMIN
router.get('/:id', requireRole('ANALYST', 'ADMIN'), async (req, res) => {
  const id = req.params['id'] as string;
  const record = await prisma.financialRecord.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  if (!record) {
    res.status(404).json({ error: 'Record not found' });
    return;
  }
  res.json(record);
});

// Create record — ADMIN only
router.post('/', requireRole('ADMIN'), validate(createRecordSchema), async (req, res) => {
  const { amount, type, category, date, notes, userId } = req.body as {
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    category: string;
    date: string;
    notes?: string;
    userId: string;
  };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const record = await prisma.financialRecord.create({
    data: {
      amount,
      type,
      category,
      date: new Date(date),
      ...(notes !== undefined ? { notes } : { notes: null }),
      userId,
    },
  });
  res.status(201).json(record);
});

// Update record — ADMIN only
router.put('/:id', requireRole('ADMIN'), validate(updateRecordSchema), async (req, res) => {
  const id = req.params['id'] as string;
  const existing = await prisma.financialRecord.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: 'Record not found' });
    return;
  }

  const { amount, type, category, date, notes } = req.body as {
    amount?: number;
    type?: 'INCOME' | 'EXPENSE';
    category?: string;
    date?: string;
    notes?: string;
  };

  const updated = await prisma.financialRecord.update({
    where: { id },
    data: {
      ...(amount !== undefined ? { amount } : {}),
      ...(type ? { type } : {}),
      ...(category ? { category } : {}),
      ...(date ? { date: new Date(date) } : {}),
      ...(notes !== undefined ? { notes } : {}),
    },
  });
  res.json(updated);
});

// Delete record — ADMIN only
router.delete('/:id', requireRole('ADMIN'), async (req, res) => {
  const id = req.params['id'] as string;
  const existing = await prisma.financialRecord.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: 'Record not found' });
    return;
  }

  await prisma.financialRecord.delete({ where: { id } });
  res.status(204).send();
});

export default router;
