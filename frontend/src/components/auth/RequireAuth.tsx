import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { FullScreenLoader } from '../ui/FullScreenLoader';

export function RequireAuth({ children }: { children: ReactNode }) {
  const status = useStore((s) => s.status);
  const location = useLocation();

  if (status === 'idle' || status === 'loading') {
    return <FullScreenLoader />;
  }
  if (status === 'guest') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
