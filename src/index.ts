import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { prisma } from './lib/prisma';
import rateLimit from 'express-rate-limit';

import usersRouter from './routes/users';
import recordsRouter from './routes/records';
import dashboardRouter from './routes/dashboard';

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { error: 'Too many requests, please try again later.' },
});

app.use(express.json());
app.use(limiter);

// Swagger docs
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml')) as object;
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/users', usersRouter);
app.use('/api/records', recordsRouter);
app.use('/api/dashboard', dashboardRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT ?? 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`API Docs available at http://localhost:${PORT}/api-docs`);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  server.close();
});

export default app;
