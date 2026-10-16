import { useCallback, useEffect, useRef, useState } from 'react';
import { API, getToken } from '../lib/api';

declare global {
  interface Window {
    FB?: {
      init: (opts: Record<string, unknown>) => void;
      login: (cb: (response: { authResponse?: { code?: string } }) => void, opts: Record<string, unknown>) => void;
    };
    fbAsyncInit?: () => void;
  }
}

type MetaConfig = {
  appId: string;
  configId: string;
  apiVersion: string;
  embeddedSignupEnabled: boolean;
};

type EmbeddedSignupPayload = {
  wabaId?: string;
  phoneNumberId?: string;
  phoneNumber?: string;
};

type Props = {
  onConnected: () => void;
  onError: (message: string) => void;
};

const FB_ORIGINS = ['https://www.facebook.com', 'https://web.facebook.com'];

function loadFacebookSdk(appId: string, version: string): Promise<void> {
  if (window.FB) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.getElementById('facebook-jssdk');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      return;
    }

    window.fbAsyncInit = () => {
      window.FB?.init({
        appId,
        cookie: true,
        xfbml: false,
        version,
      });
      resolve();
    };

    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.async = true;
    script.defer = true;
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.onerror = () => reject(new Error('Failed to load Facebook SDK'));
    document.body.appendChild(script);
  });
}

export function WhatsAppEmbeddedSignup({ onConnected, onError }: Props) {
  const [meta, setMeta] = useState<MetaConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const signupRef = useRef<EmbeddedSignupPayload>({});

  useEffect(() => {
    fetch(`${API}/config`)
      .then((r) => r.json())
      .then((data) => {
        const m = data.meta as MetaConfig | undefined;
        if (!m?.embeddedSignupEnabled) return;
        setMeta(m);
        return loadFacebookSdk(m.appId, m.apiVersion);
      })
      .then(() => setReady(true))
      .catch(() => setReady(false));
  }, []);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (!FB_ORIGINS.includes(event.origin)) return;
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data?.type !== 'WA_EMBEDDED_SIGNUP') return;
        const payload = data.data ?? data.payload ?? {};
        signupRef.current = {
          wabaId: payload.waba_id || payload.wabaId,
          phoneNumberId: payload.phone_number_id || payload.phoneNumberId,
          phoneNumber: payload.phone_number || payload.display_phone_number,
        };
      } catch {
        /* ignore non-JSON messages */
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const completeSignup = useCallback(async (code: string) => {
    const token = getToken();
    if (!token) throw new Error('Not signed in');

    const payload = signupRef.current;
    if (!payload.phoneNumberId) {
      throw new Error('Embedded Signup did not return a phone number ID. Complete the flow and try again.');
    }

    const res = await fetch(`${API}/tenant/whatsapp/embedded-signup`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        wabaId: payload.wabaId,
        phoneNumberId: payload.phoneNumberId,
        whatsappNumber: payload.phoneNumber,
      }),
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(body.error || 'Could not complete WhatsApp connection');
    }
  }, []);

  const launch = useCallback(() => {
    if (!meta || !window.FB) {
      onError('Facebook SDK not ready. Refresh and try again.');
      return;
    }

    setLoading(true);
    signupRef.current = {};

    window.FB.login(
      (response) => {
        void (async () => {
          try {
            const code = response.authResponse?.code;
            if (!code) {
              throw new Error('Embedded Signup was cancelled or did not return a code.');
            }
            await completeSignup(code);
            onConnected();
          } catch (err) {
            onError(err instanceof Error ? err.message : 'Connection failed');
          } finally {
            setLoading(false);
          }
        })();
      },
      {
        config_id: meta.configId,
        response_type: 'code',
        override_default_response_type: true,
        extras: { sessionInfoVersion: 3 },
      },
    );
  }, [completeSignup, meta, onConnected, onError]);

  if (!meta?.embeddedSignupEnabled) return null;

  return (
    <div className="dash-wa-embedded">
      <p className="dash-wa-embedded-hint">
        Connect your WhatsApp Business account through Meta. You keep ownership of your number and WABA.
      </p>
      <button
        type="button"
        className="btn btn-primary"
        disabled={!ready || loading}
        onClick={launch}
      >
        {loading ? 'Connecting…' : 'Connect with Meta Embedded Signup'}
      </button>
      {!ready && (
        <p className="field-hint">Loading Meta connection…</p>
      )}
    </div>
  );
}
