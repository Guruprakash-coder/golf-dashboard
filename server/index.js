import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRouter from './routes/auth.js';
import scoresRouter from './routes/scores.js';
import charitiesRouter from './routes/charities.js';
import drawsRouter from './routes/draws.js';
import winnersRouter from './routes/winners.js';
import usersRouter from './routes/users.js';
import subscriptionRouter from './routes/subscription.js';
import reportsRouter from './routes/reports.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ==========================================
// MODULAR API ROUTING MIDDLEWARES
// ==========================================

app.use('/api/auth', authRouter);
app.use('/api/scores', scoresRouter);
app.use('/api/charities', charitiesRouter);
app.use('/api/draws', drawsRouter);
app.use('/api/winners', winnersRouter);
app.use('/api/users', usersRouter);
app.use('/api/subscription', subscriptionRouter);
app.use('/api/admin/reports', reportsRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'An unexpected internal server error occurred.' });
});

app.listen(PORT, () => {
  console.log(`Digital Heroes Backend Server listening on http://localhost:${PORT}`);
});
