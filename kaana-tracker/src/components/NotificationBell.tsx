import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../lib/api';
import type { NotificationItem } from '../types';

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const reload = useCallback(() => {
    fetchUnreadNotificationCount().then((r) => setUnread(r.count)).catch(() => {});
    if (open) {
      fetchNotifications().then((r) => setItems(r.notifications)).catch(() => {});
    }
  }, [open]);

  useEffect(() => { reload(); }, [reload]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      fetchUnreadNotificationCount().then((r) => setUnread(r.count)).catch(() => {});
    }, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    function onDocClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  async function onOpen() {
    setOpen((v) => !v);
    if (!open) {
      const r = await fetchNotifications().catch(() => ({ notifications: [] }));
      setItems(r.notifications);
    }
  }

  async function onRead(id: number) {
    await markNotificationRead(id).catch(() => {});
    reload();
  }

  async function onReadAll() {
    await markAllNotificationsRead().catch(() => {});
    reload();
  }

  return (
    <div className="notification-bell" ref={panelRef}>
      <button type="button" className="notification-trigger" onClick={onOpen} aria-label="Notifications">
        <Bell size={18} />
        {unread > 0 && <span className="notification-badge">{unread > 99 ? '99+' : unread}</span>}
      </button>
      {open && (
        <div className="notification-panel">
          <div className="notification-panel-head">
            <strong>Notifications</strong>
            {unread > 0 && (
              <button type="button" className="btn btn-ghost btn-compact" onClick={onReadAll}>
                Mark all read
              </button>
            )}
          </div>
          <ul className="notification-list">
            {items.map((n) => (
              <li key={n.id} className={n.read_at ? 'read' : 'unread'}>
                {n.link ? (
                  <Link
                    to={n.link}
                    className="notification-item"
                    onClick={() => { if (!n.read_at) onRead(n.id); setOpen(false); }}
                  >
                    <strong>{n.title}</strong>
                    {n.body && <span className="muted">{n.body}</span>}
                    <span className="notification-time">{timeAgo(n.created_at)}</span>
                  </Link>
                ) : (
                  <div className="notification-item">
                    <strong>{n.title}</strong>
                    {n.body && <span className="muted">{n.body}</span>}
                    <span className="notification-time">{timeAgo(n.created_at)}</span>
                  </div>
                )}
              </li>
            ))}
            {!items.length && <li className="muted notification-empty">No notifications yet.</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
