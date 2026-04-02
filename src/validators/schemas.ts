import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  role: z.enum(['VIEWER', 'ANALYST', 'ADMIN']).optional(),
});

export const updateUserStatusSchema = z.object({
  active: z.boolean(),
});

export const createRecordSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1, 'Category is required'),
  date: z.string().datetime({ message: 'Invalid ISO date string' }),
  notes: z.string().optional(),
  userId: z.string().min(1, 'userId is required'),
});

export const updateRecordSchema = createRecordSchema.partial().omit({ userId: true });

export const recordFilterSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  category: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
