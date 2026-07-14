import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './layouts/Layout';
import { Landing } from './pages/public/Landing';
import { Terms } from './pages/public/Terms';
import { Privacy } from './pages/public/Privacy';
import { Register } from './pages/auth/Register';
import { Login } from './pages/auth/Login';
import { NotFound } from './pages/public/NotFound';
import { VerifyEmail } from './pages/auth/VerifyEmail';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { Onboarding } from './pages/auth/Onboarding';
import { Dashboard } from './pages/app/Dashboard';
import { CommunityDirectory } from './pages/app/CommunityDirectory';
import { CommunityDetail } from './pages/app/CommunityDetail';
import { CreateCommunity } from './pages/app/CreateCommunity';
import { Events, EventDetail } from './pages/app/Events';
import { Messaging } from './pages/app/Messaging';
import { Profile } from './pages/app/Profile';
import { Settings } from './pages/app/Settings';
import { Subscription } from './pages/app/Subscription';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ReConsent } from './pages/auth/ReConsent';
import { LeaderDashboard } from './pages/app/LeaderDashboard';
import { OrganizationPage } from './pages/app/OrganizationPage';
import { CreateEvent } from './pages/app/CreateEvent';
import { RequireAuth } from './components/auth/RequireAuth';
import { RequireRole } from './components/auth/RequireRole';
import { SessionBridge } from './components/auth/SessionBridge';
import { useStore } from './store/useStore';

export function App() {
  const bootstrap = useStore((s) => s.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return (
    <BrowserRouter>
      <SessionBridge />
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public / Marketing */}
          <Route index element={<Landing />} />
          <Route path="terms" element={<Terms />} />
          <Route path="privacy" element={<Privacy />} />

          {/* Auth */}
          <Route path="register" element={<Register />} />
          <Route path="login" element={<Login />} />
          <Route path="verify-email" element={<VerifyEmail />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="onboarding" element={<Onboarding />} />

          {/* Core App (requires an authenticated session) */}
          <Route path="dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="communities" element={<RequireAuth><CommunityDirectory /></RequireAuth>} />
          <Route path="communities/:id" element={<RequireAuth><CommunityDetail /></RequireAuth>} />
          <Route path="create-community" element={<RequireAuth><CreateCommunity /></RequireAuth>} />
          <Route path="events" element={<RequireAuth><Events /></RequireAuth>} />
          <Route path="events/:id" element={<RequireAuth><EventDetail /></RequireAuth>} />
          <Route path="messages" element={<RequireAuth><Messaging /></RequireAuth>} />
          <Route path="profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="settings" element={<RequireAuth><Settings /></RequireAuth>} />
          <Route path="pricing" element={<RequireAuth><Subscription /></RequireAuth>} />
          <Route path="re-consent" element={<RequireAuth><ReConsent /></RequireAuth>} />
          <Route path="org/:id" element={<RequireAuth><OrganizationPage /></RequireAuth>} />
          <Route
            path="create-event"
            element={
              <RequireAuth>
                <RequireRole allow={['COMMUNITY_LEADER', 'ORGANIZATION']}><CreateEvent /></RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="leader-dashboard"
            element={
              <RequireAuth>
                <RequireRole allow={['COMMUNITY_LEADER']}><LeaderDashboard /></RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="admin"
            element={
              <RequireAuth>
                <RequireRole allow={['ADMIN']}><AdminDashboard /></RequireRole>
              </RequireAuth>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
