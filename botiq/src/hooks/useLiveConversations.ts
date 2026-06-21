import { useEffect, useState } from 'react';
import { authHeaders } from '../lib/auth';
import type { Conversation } from '../types';

const API_URL = import.meta.env.VITE_WHATSAPP_API || 'http://localhost:3002/api';

export function useLiveConversations() {
  const [items, setItems] = useState<Conversation[]>([]);
  const [live, setLive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(`${API_URL}/conversations`, { headers: authHeaders() });
        if (res.status === 401) return;
        if (!res.ok) {
          if (!cancelled) {
            setLive(false);
            setError('Could not load conversations.');
          }
          return;
        }
        const data: Conversation[] = await res.json();
        if (cancelled) return;
        setLive(true);
        setError(null);
        setItems(data);
      } catch {
        if (!cancelled) {
          setLive(false);
          setError('Inbox is offline. Check your connection or try again.');
        }
      }
    }

    poll();
    const id = setInterval(poll, 3000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  return { items, setItems, live, error };
}
