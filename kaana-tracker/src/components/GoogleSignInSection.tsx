import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { isGoogleAuthEnabled, loginWithGoogle } from '../lib/auth';

type Props = {
  redirectUrl: string;
  onError: (message: string) => void;
  disabled?: boolean;
};

export function GoogleSignInSection({ redirectUrl, onError, disabled }: Props) {
  if (!isGoogleAuthEnabled()) return null;

  async function handleSuccess(response: CredentialResponse) {
    if (!response.credential) {
      onError('Google sign-in failed');
      return;
    }
    try {
      await loginWithGoogle(response.credential);
      window.location.href = redirectUrl;
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Google sign-in failed');
    }
  }

  return (
    <>
      <div className="auth-divider">or</div>
      <div className="google-signin-wrap">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => onError('Google sign-in failed')}
          theme="outline"
          size="large"
          text="continue_with"
          shape="rectangular"
          width="384"
          locale="en"
          useOneTap={false}
          containerProps={{ style: { opacity: disabled ? 0.6 : 1, pointerEvents: disabled ? 'none' : 'auto' } }}
        />
      </div>
    </>
  );
}
