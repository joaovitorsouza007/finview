import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import categoryRoutes from './routes/category.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import goalRoutes from './routes/goal.routes.js';
import metricsRoutes from './routes/metrics.routes.js';
import rulesRoutes from './routes/rules.routes.js';
import notificationRoutes from './routes/notifications.routes.js';
import savingsGoalsRoutes from './routes/savings-goals.routes.js';
import accountsRoutes from './routes/accounts.routes.js';
import banksRoutes from './routes/banks.routes.js';
import sharingRoutes from './routes/sharing.routes.js';
import { notFound, errorHandler } from './middleware/error.js';

// Monta a aplicação Express (separada do listen para facilitar testes)
export function createApp() {
  const app = express();

  app.use(cors({ origin: true }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (req, res) => res.json({ ok: true }));

  app.use('/api/auth', authRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/transactions', transactionRoutes);
  app.use('/api/goal', goalRoutes);
  app.use('/api/metrics', metricsRoutes);
  app.use('/api/rules', rulesRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/savings-goals', savingsGoalsRoutes);
  app.use('/api/accounts', accountsRoutes);
  app.use('/api/banks', banksRoutes);
  app.use('/api/sharing', sharingRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
