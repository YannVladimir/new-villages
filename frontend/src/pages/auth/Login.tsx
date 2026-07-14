import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { useLogin, useTermsStatus } from '../../hooks/useAuth';
import { ApiError } from '../../lib/apiClient';
import { Loader2 } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [loggedInPendingTermsCheck, setLoggedInPendingTermsCheck] = useState(false);

  // Only fires once login succeeds, to decide whether to route to /re-consent.
  const { data: termsStatus } = useTermsStatus(loggedInPendingTermsCheck);

  React.useEffect(() => {
    if (!termsStatus) return;
    navigate(termsStatus.upToDate ? '/dashboard' : '/re-consent');
  }, [termsStatus, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => setLoggedInPendingTermsCheck(true),
        onError: (err) => {
          if (err instanceof ApiError) {
            if (err.code === 'EMAIL_NOT_VERIFIED') {
              navigate('/verify-email', { state: { email } });
              return;
            }
            setFormError(err.message);
          } else {
            setFormError('Something went wrong. Please try again.');
          }
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background-light py-12 px-4 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-heading font-bold mb-2">Welcome Back</h1>
            <p className="text-gray-600">Log in to your OneVillage account.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl">
                {formError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <Input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" size="lg" className="w-full mt-6 flex items-center justify-center gap-2" disabled={loginMutation.isPending}>
              {loginMutation.isPending && <Loader2 size={18} className="animate-spin" />}
              Log In
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="outline" className="opacity-50 cursor-not-allowed">Google</Button>
              <Button type="button" variant="outline" className="opacity-50 cursor-not-allowed">Apple</Button>
            </div>

            <p className="text-center text-sm text-gray-600 mt-6">
              Don't have an account? <Link to="/register" className="text-primary hover:underline font-medium">Sign up</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
