import { nanoid } from 'nanoid';
import { getDb } from '../db/index.js';

export function trackSiteEvent({ event = 'pageview', path = '/', referrer = '', userAgent = '', meta = {} }) {
  const db = getDb();
  const safePath = String(path).slice(0, 500);
  db.prepare(`
    INSERT INTO site_events (id, event_type, path, referrer, user_agent, meta)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    nanoid(),
    event,
    safePath,
    String(referrer).slice(0, 500),
    String(userAgent).slice(0, 300),
    JSON.stringify(meta),
  );
}

function countRows(sql, param) {
  const row = param !== undefined ? getDb().prepare(sql).get(param) : getDb().prepare(sql).get();
  return row?.c ?? 0;
}

export function getAdminOverview() {
  const db = getDb();

  const pageviewsToday = countRows(
    `SELECT COUNT(*) as c FROM site_events WHERE event_type = 'pageview' AND date(created_at) = date('now')`,
  );
  const pageviewsWeek = countRows(
    `SELECT COUNT(*) as c FROM site_events WHERE event_type = 'pageview' AND created_at >= datetime('now', '-7 days')`,
  );
  const pageviewsTotal = countRows(`SELECT COUNT(*) as c FROM site_events WHERE event_type = 'pageview'`);

  const signupsToday = countRows(
    `SELECT COUNT(*) as c FROM tenants WHERE date(created_at) = date('now')`,
  );
  const signupsWeek = countRows(
    `SELECT COUNT(*) as c FROM tenants WHERE created_at >= datetime('now', '-7 days')`,
  );
  const signupsTotal = countRows(`SELECT COUNT(*) as c FROM tenants`);

  const leadsToday = countRows(
    `SELECT COUNT(*) as c FROM site_leads WHERE date(created_at) = date('now')`,
  );
  const leadsWeek = countRows(
    `SELECT COUNT(*) as c FROM site_leads WHERE created_at >= datetime('now', '-7 days')`,
  );
  const leadsTotal = countRows(`SELECT COUNT(*) as c FROM site_leads`);

  const topPaths = db.prepare(`
    SELECT path, COUNT(*) as views
    FROM site_events
    WHERE event_type = 'pageview' AND created_at >= datetime('now', '-30 days')
    GROUP BY path
    ORDER BY views DESC
    LIMIT 10
  `).all();

  const recentEvents = db.prepare(`
    SELECT event_type, path, created_at
    FROM site_events
    ORDER BY created_at DESC
    LIMIT 20
  `).all();

  const recentNotifications = db.prepare(`
    SELECT kind, subject, sent_email, created_at
    FROM platform_notifications
    ORDER BY created_at DESC
    LIMIT 15
  `).all();

  const billing = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
      SUM(CASE WHEN status = 'active' THEN amount ELSE 0 END) as revenue_paise
    FROM subscriptions
  `).get();

  const recentPayments = db.prepare(`
    SELECT s.plan, s.amount, s.status, s.razorpay_payment_id, s.created_at, t.name as tenant_name
    FROM subscriptions s
    JOIN tenants t ON t.id = s.tenant_id
    ORDER BY s.created_at DESC
    LIMIT 10
  `).all();

  const recentLeads = db.prepare(`
    SELECT name, phone, source, path, created_at
    FROM site_leads
    ORDER BY created_at DESC
    LIMIT 10
  `).all();

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

export function listBillingForAdmin() {
  return getDb().prepare(`
    SELECT s.*, t.name as tenant_name, t.slug, u.email as owner_email
    FROM subscriptions s
    JOIN tenants t ON t.id = s.tenant_id
    LEFT JOIN users u ON u.tenant_id = t.id AND u.role = 'owner'
    ORDER BY s.created_at DESC
  `).all();
}
