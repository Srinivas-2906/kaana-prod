import 'dotenv/config';
import express from 'express';
import { initDatabase } from './db/index.js';
import { ensureM4Schema } from './services/schemaService.js';
import { corsMiddleware } from './middleware/cors.js';
import authRouter from './routes/auth.js';
import projectsRouter from './routes/projects.js';
import workItemsRouter from './routes/workItems.js';
import planRouter from './routes/plan.js';
import transactionsRouter from './routes/transactions.js';
import discussionsRouter from './routes/discussions.js';
import whiteboardsRouter from './routes/whiteboards.js';
import activityRouter from './routes/activity.js';
import journalRouter from './routes/journal.js';
import decisionsRouter from './routes/decisions.js';
import remindersRouter from './routes/reminders.js';
import attachmentsRouter from './routes/attachments.js';

const app = express();
const PORT = process.env.PORT || 3011;

await initDatabase();
await ensureM4Schema();

app.use(express.json({ limit: '10mb' }));
app.use(corsMiddleware);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'kaana-tracker-api', version: 'm3' });
});

app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/work-items', workItemsRouter);
app.use('/api/plan', planRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/discussions', discussionsRouter);
app.use('/api/whiteboards', whiteboardsRouter);
app.use('/api/activity', activityRouter);
app.use('/api/journal', journalRouter);
app.use('/api/decisions', decisionsRouter);
app.use('/api/reminders', remindersRouter);
app.use('/api/attachments', attachmentsRouter);

app.get('/', (_req, res) => {
  res.json({ ok: true, service: 'kaana-tracker-api' });
});

app.listen(PORT, () => {
  console.log(`Kaana Tracker API http://localhost:${PORT}/api/health`);
});
