import { nanoid } from 'nanoid';
import { getOne, getAll, run } from '../db/query.js';

export async function trackSiteEvent({ event = 'pageview', path = '/', referrer = '', userAgent = '', meta = {} }) {
  const safePath = String(path).slice(0, 500);
  await run(`
    INSERT INTO site_events (id, event_type, path, referrer, user_agent, meta)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    nanoid(),
    event,
    safePath,
    String(referrer).slice(0, 500),
    String(userAgent).slice(0, 300),
    JSON.stringify(meta),
  ]);
}

async function countRows(sql, param) {
  const row = param !== undefined
    ? await getOne(sql, [param])
    : await getOne(sql);
  return row?.c ?? 0;
}

export async function getAdminOverview() {
  const pageviewsToday = await countRows(
    `SELECT COUNT(*)::int AS c FROM site_events WHERE event_type = 'pageview' AND created_at::date = CURRENT_DATE`,
  );
  const pageviewsWeek = await countRows(
    `SELECT COUNT(*)::int AS c FROM site_events WHERE event_type = 'pageview' AND created_at >= NOW() - INTERVAL '7 days'`,
  );
  const pageviewsTotal = await countRows(`SELECT COUNT(*)::int AS c FROM site_events WHERE event_type = 'pageview'`);

  const signupsToday = await countRows(
    `SELECT COUNT(*)::int AS c FROM tenants WHERE created_at::date = CURRENT_DATE`,
  );
  const signupsWeek = await countRows(
    `SELECT COUNT(*)::int AS c FROM tenants WHERE created_at >= NOW() - INTERVAL '7 days'`,
  );
  const signupsTotal = await countRows(`SELECT COUNT(*)::int AS c FROM tenants`);

  const leadsToday = await countRows(
    `SELECT COUNT(*)::int AS c FROM site_leads WHERE created_at::date = CURRENT_DATE`,
  );
  const leadsWeek = await countRows(
    `SELECT COUNT(*)::int AS c FROM site_leads WHERE created_at >= NOW() - INTERVAL '7 days'`,
  );
  const leadsTotal = await countRows(`SELECT COUNT(*)::int AS c FROM site_leads`);

  const topPaths = await getAll(`
    SELECT path, COUNT(*)::int AS views
    FROM site_events
    WHERE event_type = 'pageview' AND created_at >= NOW() - INTERVAL '30 days'
    GROUP BY path
    ORDER BY views DESC
    LIMIT 10
  `);

  const recentEvents = await getAll(`
    SELECT event_type, path, created_at
    FROM site_events
    ORDER BY created_at DESC
    LIMIT 20
  `);

  const recentNotifications = await getAll(`
    SELECT kind, subject, sent_email, created_at
    FROM platform_notifications
    ORDER BY created_at DESC
    LIMIT 15
  `);

  const billing = await getOne(`
    SELECT
      COUNT(*)::int AS total,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END)::int AS active,
      SUM(CASE WHEN status = 'active' THEN amount ELSE 0 END)::bigint AS revenue_paise
    FROM subscriptions
  `);

  const recentPayments = await getAll(`
    SELECT s.plan, s.amount, s.status, s.razorpay_payment_id, s.created_at, t.name as tenant_name
    FROM subscriptions s
    JOIN tenants t ON t.id = s.tenant_id
    ORDER BY s.created_at DESC
    LIMIT 10
  `);

  const recentLeads = await getAll(`
    SELECT name, phone, source, path, created_at
    FROM site_leads
    ORDER BY created_at DESC
    LIMIT 10
  `);

  return {
    notifyEmail: process.env.KAANA_NOTIFY_EMAIL || 'srinivas@kaana.in',
    emailConfigured: !!process.env.RESEND_API_KEY,
    visitors: {
      pageviewsToday,
      pageviewsWeek,
      pageviewsTotal,
    },
    signups: {
      today: signupsToday,
      week: signupsWeek,
      total: signupsTotal,
    },
    leads: {
      today: leadsToday,
      week: leadsWeek,
      total: leadsTotal,
    },
    topPaths,
    billing: {
      totalOrders: billing?.total ?? 0,
      activeSubscriptions: billing?.active ?? 0,
      revenueInr: Math.round((billing?.revenue_paise ?? 0) / 100),
    },
    recentEvents,
    recentNotifications,
    recentPayments,
    recentLeads,
  };
}

export async function listBillingForAdmin() {
  return getAll(`
    SELECT s.*, t.name as tenant_name, t.slug, u.email as owner_email
    FROM subscriptions s
    JOIN tenants t ON t.id = s.tenant_id
    LEFT JOIN users u ON u.tenant_id = t.id AND u.role = 'owner'
    ORDER BY s.created_at DESC
  `);
}
