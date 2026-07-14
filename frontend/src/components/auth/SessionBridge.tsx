import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';

/**
 * Bridges apiClient's window events (which have no access to React Router or
 * the store) to real navigation/state changes. Handles two cases raised
 * from anywhere in the app: the refresh token finally expired, or the
 * TermsGateFilter blocked a request because Terms were republished.
 */
export function SessionBridge() {
  const navigate = useNavigate();
  const clearSession = useStore((s) => s.clearSession);

  useEffect(() => {
    const onSessionExpired = () => {
      clearSession();
      navigate('/login');
    };
    const onTermsRequired = () => {
      navigate('/re-consent');
    };

    window.addEventListener('auth:session-expired', onSessionExpired);
    window.addEventListener('auth:terms-required', onTermsRequired);
    return () => {
      window.removeEventListener('auth:session-expired', onSessionExpired);
      window.removeEventListener('auth:terms-required', onTermsRequired);
    };
  }, [navigate, clearSession]);

  return null;
}
