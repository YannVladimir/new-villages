import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RequireAuth } from './RequireAuth';
import { useStore, type SessionStatus } from '../../store/useStore';

function renderWithStatus(status: SessionStatus) {
  useStore.setState({ status, currentUser: null });
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <div>Protected Dashboard</div>
            </RequireAuth>
          }
        />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('RequireAuth', () => {
  beforeEach(() => {
    useStore.setState({ currentUser: null, status: 'idle' });
  });

  it('shows a loader while the session is still being bootstrapped', () => {
    const { container } = renderWithStatus('loading');
    expect(screen.queryByText('Protected Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders protected content once authenticated', () => {
    renderWithStatus('authenticated');
    expect(screen.getByText('Protected Dashboard')).toBeInTheDocument();
  });

  it('redirects to /login for a guest', () => {
    renderWithStatus('guest');
    expect(screen.queryByText('Protected Dashboard')).not.toBeInTheDocument();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});
