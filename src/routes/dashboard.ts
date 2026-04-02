import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', async (_req, res) => {
  const [incomeAgg, expenseAgg, categoryTotals, recentActivity] = await Promise.all([
    prisma.financialRecord.aggregate({
      where: { type: 'INCOME', deletedAt: null },
      _sum: { amount: true },
    }),
    prisma.financialRecord.aggregate({
      where: { type: 'EXPENSE', deletedAt: null },
      _sum: { amount: true },
    }),
    prisma.financialRecord.groupBy({
      by: ['category', 'type'],
      where: { deletedAt: null },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
    }),
    prisma.financialRecord.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { user: { select: { id: true, name: true } } },
    }),
  ]);

  const totalIncome = incomeAgg._sum.amount ?? 0;
  const totalExpenses = expenseAgg._sum.amount ?? 0;

  res.json({
    summary: {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
    },
    categoryBreakdown: categoryTotals.map((c: { category: string; type: string; _sum: { amount: number | null } }) => ({
      category: c.category,
      type: c.type,
      total: c._sum.amount ?? 0,
    })),
    recentActivity,
  });
});

export default router;
