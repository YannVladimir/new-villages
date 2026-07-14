import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { useResetPassword } from '../../hooks/useAuth';
import { ApiError } from '../../lib/apiClient';
import { Loader2 } from 'lucide-react';

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const resetPassword = useResetPassword();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (newPassword !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }
    if (!token) {
      setFormError('This reset link is missing its token. Please request a new one.');
      return;
    }

    resetPassword.mutate(
      { token, newPassword },
      {
        onSuccess: () => navigate('/login'),
        onError: (err) => setFormError(err instanceof ApiError ? err.message : 'Something went wrong.'),
      }
    );
  };

  return (
    <div className="min-h-screen bg-background-light py-12 px-4 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-heading font-bold mb-2">Choose a new password</h1>
            <p className="text-gray-600">Make it something you haven't used before.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl">
                {formError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">New password</label>
              <Input required type="password" minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm new password</label>
              <Input required type="password" minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            <Button type="submit" size="lg" className="w-full mt-2 flex items-center justify-center gap-2" disabled={resetPassword.isPending}>
              {resetPassword.isPending && <Loader2 size={18} className="animate-spin" />}
              Reset password
            </Button>
            <p className="text-center text-sm text-gray-600 mt-6">
              <Link to="/login" className="text-primary hover:underline font-medium">Back to log in</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
