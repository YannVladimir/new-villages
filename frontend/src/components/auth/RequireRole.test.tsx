import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RequireRole } from './RequireRole';
import { useStore } from '../../store/useStore';
import type { User } from '../../types/api';

function baseUser(overrides: Partial<User> = {}): User {
  return {
    id: 'u1',
    fullName: 'Jane Doe',
    email: 'jane@onevillage.ca',
    role: 'MEMBER',
    accountStatus: 'ACTIVE',
    emailVerified: true,
    spokenLanguages: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function renderWithRole(user: User | null) {
  useStore.setState({ currentUser: user });
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route
          path="/admin"
          element={
            <RequireRole allow={['ADMIN']}>
              <div>Admin Only Content</div>
            </RequireRole>
          }
        />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('RequireRole', () => {
  beforeEach(() => {
    useStore.setState({ currentUser: null, status: 'idle' });
  });

  it('renders the protected content when the user has an allowed role', () => {
    renderWithRole(baseUser({ role: 'ADMIN' }));
    expect(screen.getByText('Admin Only Content')).toBeInTheDocument();
  });

  it('redirects away when the user has a disallowed role', () => {
    renderWithRole(baseUser({ role: 'MEMBER' }));
    expect(screen.queryByText('Admin Only Content')).not.toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('redirects away when there is no current user at all', () => {
    renderWithRole(null);
    expect(screen.queryByText('Admin Only Content')).not.toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
