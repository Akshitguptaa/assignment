import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../index';
// import { prisma } from '../lib/prisma';

// Mock DB to prevent tests from hitting live DB
vi.mock('../lib/prisma', () => ({
  prisma: {
    $disconnect: vi.fn(),
    financialRecord: {
      aggregate: vi.fn().mockResolvedValue({ _sum: { amount: 100 } }),
      groupBy: vi.fn().mockResolvedValue([]),
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

describe('App Endpoints', () => {
  describe('GET /health', () => {
    it('should return 200 OK and status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
    });
  });

  describe('Dashboard Access Control', () => {
    it('should block access without a valid role', async () => {
      const res = await request(app).get('/api/dashboard');
      expect(res.status).toBe(401); // Unauthorized for missing headers
    });

    it('should allow access with VIEWER role', async () => {
      const res = await request(app)
        .get('/api/dashboard')
        .set('X-User-Role', 'VIEWER');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('summary');
    });
  });
});
