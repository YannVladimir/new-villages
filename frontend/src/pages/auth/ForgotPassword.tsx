import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';
import { useForgotPassword } from '../../hooks/useAuth';
import { Mail, Loader2 } from 'lucide-react';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const forgotPassword = useForgotPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    forgotPassword.mutate(email);
  };

  if (forgotPassword.isSuccess) {
    return (
      <div className="min-h-screen bg-background-light py-12 px-4 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail size={32} />
            </div>
            <h1 className="text-2xl font-heading font-bold mb-4">Check your email</h1>
            <p className="text-gray-600 mb-8">
              If an account exists for <strong>{email}</strong>, we've sent a link to reset your password.
            </p>
            <Link to="/login" className="text-primary hover:underline font-medium text-sm">Back to log in</Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light py-12 px-4 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-heading font-bold mb-2">Forgot password?</h1>
            <p className="text-gray-600">Enter your email and we'll send you a reset link.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button type="submit" size="lg" className="w-full mt-2 flex items-center justify-center gap-2" disabled={forgotPassword.isPending}>
              {forgotPassword.isPending && <Loader2 size={18} className="animate-spin" />}
              Send reset link
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
