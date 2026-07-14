import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import type { UserRole } from '../../types/api';

export function RequireRole({ allow, children }: { allow: UserRole[]; children: ReactNode }) {
  const currentUser = useStore((s) => s.currentUser);

  if (!currentUser || !allow.includes(currentUser.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
