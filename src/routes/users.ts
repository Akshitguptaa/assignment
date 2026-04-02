import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createUserSchema, updateUserStatusSchema } from '../validators/schemas';

const router = Router();

router.use(authenticate);

// Create a user — ADMIN only
router.post('/', requireRole('ADMIN'), validate(createUserSchema), async (req, res) => {
  const { name, email, role } = req.body as { name: string; email: string; role?: 'VIEWER' | 'ANALYST' | 'ADMIN' };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: 'Email already in use' });
    return;
  }

  const user = await prisma.user.create({
    data: { name, email, ...(role ? { role } : {}) },
  });
  res.status(201).json(user);
});

// List all users — ADMIN only
router.get('/', requireRole('ADMIN'), async (_req, res) => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(users);
});

// Get a single user — ADMIN only
router.get('/:id', requireRole('ADMIN'), async (req, res) => {
  const id = req.params['id'] as string;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json(user);
});

// Toggle active status — ADMIN only
router.patch('/:id/status', requireRole('ADMIN'), validate(updateUserStatusSchema), async (req, res) => {
  const id = req.params['id'] as string;
  const { active } = req.body as { active: boolean };

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { active },
  });
  res.json(updated);
});

export default router;
