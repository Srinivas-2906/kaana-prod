import { FormEvent, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSignIn, useSignUp } from '@clerk/clerk-react';
import { CLERK_AFTER_AUTH_URL } from '../lib/clerkAuth';
import { clerkRegister } from '../lib/auth';

function clerkErrorMessage(err: unknown) {
  const clerkErr = err as { errors?: Array<{ longMessage?: string; message?: string }> };
  return clerkErr.errors?.[0]?.longMessage
    || clerkErr.errors?.[0]?.message
    || (err instanceof Error ? err.message : 'Something went wrong');
}

function absoluteRedirectUrl(redirectUrl: string) {
  const trimmed = String(redirectUrl || '').trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('/')) return `${window.location.origin}${trimmed}`;
  return `${window.location.origin}/`;
}

type SignInAttempt = {
  status?: string | null;
  createdSessionId?: string | null;
  supportedFirstFactors?: Array<{ strategy?: string; emailAddressId?: string }>;
  supportedSecondFactors?: Array<{ strategy?: string }>;
};

async function signInWithPassword(
  signIn: NonNullable<ReturnType<typeof useSignIn>['signIn']>,
  email: string,
  password: string,
): Promise<SignInAttempt> {
  await signIn.create({ identifier: email.trim() });
  return signIn.attemptFirstFactor({ strategy: 'password', password }) as Promise<SignInAttempt>;
}

function getEmailCodeFactorEmailId(
  signIn: NonNullable<ReturnType<typeof useSignIn>['signIn']>,
  attempt: SignInAttempt,
) {
  const factors = attempt.supportedFirstFactors || (signIn as unknown as SignInAttempt).supportedFirstFactors || [];
  return factors.find((f) => f.strategy === 'email_code' && f.emailAddressId)?.emailAddressId || null;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  borderRadius: '0.5rem',
  border: '1px solid var(--border)',
  marginBottom: '1rem',
  boxSizing: 'border-box',
};

export function ClerkSignUpForm() {
  const { isLoaded, signUp } = useSignUp();
  const { isLoaded: signInLoaded, signIn, setActive } = useSignIn();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirectUrl = params.get('redirect_url') || CLERK_AFTER_AUTH_URL;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'password' | 'email_code'>('password');
  const [emailAddressId, setEmailAddressId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onGoogle() {
    if (!isLoaded || !signUp) return;
    setError('');
    try {
      await signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: absoluteRedirectUrl(redirectUrl),
      });
    } catch (err) {
      setError(clerkErrorMessage(err));
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signInLoaded || !signIn) return;
    setLoading(true);
    setError('');
    try {
      await clerkRegister(email.trim(), password);
      const attempt = await signInWithPassword(signIn, email, password);
      if (attempt.status === 'complete' && attempt.createdSessionId) {
        await setActive({ session: attempt.createdSessionId });
        navigate(redirectUrl, { replace: true });
        return;
      }

      const id = getEmailCodeFactorEmailId(signIn, attempt);
      if (id) {
        await signIn.prepareFirstFactor({ strategy: 'email_code', emailAddressId: id });
        setEmailAddressId(id);
        setStep('email_code');
        return;
      }

      setError(`Sign-in needs additional verification (status: ${attempt.status || 'unknown'}).`);
    } catch (err) {
      setError(clerkErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function onVerifyCode(e: FormEvent) {
    e.preventDefault();
    if (!signInLoaded || !signIn) return;
    setLoading(true);
    setError('');
    try {
      const attempt = await signIn.attemptFirstFactor({ strategy: 'email_code', code: code.trim() }) as SignInAttempt;
      if (attempt.status === 'complete' && attempt.createdSessionId) {
        await setActive({ session: attempt.createdSessionId });
        navigate(redirectUrl, { replace: true });
        return;
      }
      setError(`Verification not complete (status: ${attempt.status || 'unknown'}).`);
    } catch (err) {
      setError(clerkErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (step === 'email_code') {
    return (
      <form className="kaana-auth-form" onSubmit={onVerifyCode}>
        {error && <p className="auth-form-error">{error}</p>}
        <label className="muted auth-label">Email verification code</label>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{ ...inputStyle, marginBottom: '1.25rem' }}
        />
        <button type="submit" className="btn btn-primary auth-submit" disabled={loading || !signInLoaded}>
          {loading ? 'Verifying…' : 'Verify'}
        </button>
        <button
          type="button"
          className="btn btn-ghost auth-oauth-btn"
          disabled={loading || !emailAddressId}
          onClick={async () => {
            if (!signIn || !emailAddressId) return;
            setError('');
            try {
              await signIn.prepareFirstFactor({ strategy: 'email_code', emailAddressId });
            } catch (err) {
              setError(clerkErrorMessage(err));
            }
          }}
        >
          Resend code
        </button>
        <button
          type="button"
          className="btn btn-ghost auth-oauth-btn"
          disabled={loading}
          onClick={() => {
            setStep('password');
            setCode('');
            setEmailAddressId(null);
            setError('');
            (signIn as unknown as { reset?: () => void })?.reset?.();
          }}
        >
          Start over
        </button>
      </form>
    );
  }

  return (
    <form className="kaana-auth-form" onSubmit={onSubmit}>
      {error && <p className="auth-form-error">{error}</p>}
      <button type="button" className="btn btn-ghost auth-oauth-btn" onClick={onGoogle} disabled={loading}>
        Continue with Google
      </button>
      <div className="auth-divider"><span>or</span></div>
      <label className="muted auth-label">Email address</label>
      <input
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        style={inputStyle}
      />
      <label className="muted auth-label">Password</label>
      <input
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ ...inputStyle, marginBottom: '1.25rem' }}
      />
      <button type="submit" className="btn btn-primary auth-submit" disabled={loading || !isLoaded || !signInLoaded}>
        {loading ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}

export function ClerkSignInForm() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirectUrl = params.get('redirect_url') || CLERK_AFTER_AUTH_URL;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'password' | 'email_code'>('password');
  const [emailAddressId, setEmailAddressId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onGoogle() {
    if (!isLoaded || !signIn) return;
    setError('');
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: absoluteRedirectUrl(redirectUrl),
      });
    } catch (err) {
      setError(clerkErrorMessage(err));
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signIn) return;
    setLoading(true);
    setError('');
    try {
      const attempt = await signInWithPassword(signIn, email, password);
      if (attempt.status === 'complete' && attempt.createdSessionId) {
        await setActive({ session: attempt.createdSessionId });
        navigate(redirectUrl, { replace: true });
        return;
      }

      const id = getEmailCodeFactorEmailId(signIn, attempt);
      if (id) {
        await signIn.prepareFirstFactor({ strategy: 'email_code', emailAddressId: id });
        setEmailAddressId(id);
        setStep('email_code');
        return;
      }

      setError(`Sign-in needs additional verification (status: ${attempt.status || 'unknown'}).`);
    } catch (err) {
      setError(clerkErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function onVerifyCode(e: FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signIn) return;
    setLoading(true);
    setError('');
    try {
      const attempt = await signIn.attemptFirstFactor({ strategy: 'email_code', code: code.trim() }) as SignInAttempt;
      if (attempt.status === 'complete' && attempt.createdSessionId) {
        await setActive({ session: attempt.createdSessionId });
        navigate(redirectUrl, { replace: true });
        return;
      }
      setError(`Verification not complete (status: ${attempt.status || 'unknown'}).`);
    } catch (err) {
      setError(clerkErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (step === 'email_code') {
    return (
      <form className="kaana-auth-form" onSubmit={onVerifyCode}>
        {error && <p className="auth-form-error">{error}</p>}
        <label className="muted auth-label">Email verification code</label>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{ ...inputStyle, marginBottom: '1.25rem' }}
        />
        <button type="submit" className="btn btn-primary auth-submit" disabled={loading || !isLoaded}>
          {loading ? 'Verifying…' : 'Verify'}
        </button>
        <button
          type="button"
          className="btn btn-ghost auth-oauth-btn"
          disabled={loading || !emailAddressId}
          onClick={async () => {
            if (!signIn || !emailAddressId) return;
            setError('');
            try {
              await signIn.prepareFirstFactor({ strategy: 'email_code', emailAddressId });
            } catch (err) {
              setError(clerkErrorMessage(err));
            }
          }}
        >
          Resend code
        </button>
        <button
          type="button"
          className="btn btn-ghost auth-oauth-btn"
          disabled={loading}
          onClick={() => {
            setStep('password');
            setCode('');
            setEmailAddressId(null);
            setError('');
            (signIn as unknown as { reset?: () => void })?.reset?.();
          }}
        >
          Start over
        </button>
      </form>
    );
  }

  return (
    <form className="kaana-auth-form" onSubmit={onSubmit}>
      {error && <p className="auth-form-error">{error}</p>}
      <button type="button" className="btn btn-ghost auth-oauth-btn" onClick={onGoogle} disabled={loading}>
        Continue with Google
      </button>
      <div className="auth-divider"><span>or</span></div>
      <label className="muted auth-label">Email address</label>
      <input
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        style={inputStyle}
      />
      <label className="muted auth-label">Password</label>
      <input
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ ...inputStyle, marginBottom: '1.25rem' }}
      />
      <button type="submit" className="btn btn-primary auth-submit" disabled={loading || !isLoaded}>
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
