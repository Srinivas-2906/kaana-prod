import 'dotenv/config';
import express from 'express';
import { initDatabase } from './db/index.js';
import { ensureBaseSchema, ensureM4Schema, ensureClerkSchema, ensureInviteSchema, ensureTopicSchema, ensureEngagementSchema, ensureFunSchema, ensureEditSchema, ensureProSchema, ensurePhase2Schema, ensureFinanceSchema, ensureOnboardingSchema } from './services/schemaService.js';
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
import invitesRouter from './routes/invites.js';
import notificationsRouter from './routes/notifications.js';
import searchRouter from './routes/search.js';
import financeRouter from './routes/finance.js';

const app = express();
const PORT = process.env.PORT || 3011;

await initDatabase();
await ensureBaseSchema();
await ensureM4Schema();
await ensureClerkSchema();
await ensureInviteSchema();
await ensureTopicSchema();
await ensureEngagementSchema();
await ensureFunSchema();
await ensureEditSchema();
await ensureProSchema();
await ensurePhase2Schema();
await ensureFinanceSchema();
await ensureOnboardingSchema();

app.use(express.json({ limit: '10mb' }));
app.use(corsMiddleware);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'kaana-tracker-api', version: 'm5-jwt' });
});

app.use('/api/auth', authRouter);
app.use('/api/invites', invitesRouter);
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
app.use('/api/notifications', notificationsRouter);
app.use('/api/search', searchRouter);
app.use('/api', financeRouter);

app.get('/', (_req, res) => {
  res.json({ ok: true, service: 'kaana-tracker-api' });
});

app.listen(PORT, () => {
  console.log(`Kaana Tracker API http://localhost:${PORT}/api/health`);
});
