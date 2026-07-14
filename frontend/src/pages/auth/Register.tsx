import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useCurrentTerms, useRegister, type RegisterRequest } from '../../hooks/useAuth';
import { ApiError } from '../../lib/apiClient';
import { UserCircle, Shield, Building2, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { PageTransition } from '../../components/ui/PageTransition';

export function Register() {
  const navigate = useNavigate();
  const { data: terms, isLoading: termsLoading } = useCurrentTerms();
  const registerMutation = useRegister();

  const [role, setRole] = useState<RegisterRequest['accountType']>('MEMBER');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('Canada');
  const [city, setCity] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('English');

  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [termsOpened, setTermsOpened] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!termsAccepted || !terms) return;
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    registerMutation.mutate(
      {
        fullName,
        email,
        password,
        country,
        city,
        preferredLanguage,
        accountType: role,
        acceptedTermsVersion: terms.version,
      },
      {
        onSuccess: () => navigate('/verify-email', { state: { email } }),
        onError: (err) => {
          if (err instanceof ApiError) {
            setFormError(err.message);
          } else {
            setFormError('Something went wrong. Please try again.');
          }
        },
      }
    );
  };

  const openTerms = (e: React.MouseEvent) => {
    e.preventDefault();
    setTermsModalOpen(true);
    setTermsOpened(true);
  };

  const canAccept = termsOpened && !!terms;

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F6F5FB] flex flex-col">
        {/* Minimal Header */}
        <header className="flex items-center justify-between px-6 md:px-12 py-6 max-w-[1600px] mx-auto w-full">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.jpeg" alt="OneVillage" className="w-8 h-8 rounded-full object-contain bg-white" />
            <div>
              <span className="font-heading font-bold text-lg text-[#2D2159] leading-none block">OneVillage</span>
              <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest block mt-0.5"><span className="text-red-500">🍁</span> Made in Canada</span>
            </div>
          </Link>
          <Link to="/login" className="text-[#2D2159] font-semibold text-sm hover:underline">
            Log in &rarr;
          </Link>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="w-full max-w-[900px]">
            <div className="mb-10 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-[#2D2159] mb-3">Create your account</h1>
              <p className="text-gray-500 text-lg">It only takes a minute. Free forever for members.</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-10">

              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl">
                  {formError}
                </div>
              )}

              {/* ABOUT YOU */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">About you</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full name</label>
                    <Input required placeholder="Amara Okafor" value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-white border-gray-200 rounded-xl py-6" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                    <Input required type="email" placeholder="you@onevillage.ca" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white border-gray-200 rounded-xl py-6" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                    <Input required type="password" placeholder="••••••••" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white border-gray-200 rounded-xl py-6" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm password</label>
                    <Input required type="password" placeholder="••••••••" minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-white border-gray-200 rounded-xl py-6" />
                  </div>
                </div>
              </div>

              {/* WHERE YOU ARE */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Where you are</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Country</label>
                    <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full h-14 rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none">
                      <option>Canada</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
                    <Input required placeholder="Toronto" value={city} onChange={(e) => setCity(e.target.value)} className="bg-white border-gray-200 rounded-xl py-6 h-14" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Preferred language</label>
                    <select value={preferredLanguage} onChange={(e) => setPreferredLanguage(e.target.value)} className="w-full h-14 rounded-xl border border-gray-200 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none">
                      <option>English</option>
                      <option>Français</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* I'M JOINING AS A... */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">I'm joining as a...</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { id: 'MEMBER' as const, label: 'Member', icon: UserCircle, desc: 'Join and take part in communities.' },
                    { id: 'COMMUNITY_LEADER' as const, label: 'Community Leader', icon: Shield, desc: 'Create and manage a community.' },
                    { id: 'ORGANIZATION' as const, label: 'Organization', icon: Building2, desc: 'Represent a business or nonprofit.' }
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setRole(type.id)}
                      className={cn(
                        "flex flex-col text-left p-6 rounded-2xl border-2 transition-all bg-white shadow-sm",
                        role === type.id
                          ? "border-[#2D2159] bg-[#F2F0FA]"
                          : "border-transparent hover:border-gray-200 text-gray-600"
                      )}
                    >
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-4", role === type.id ? "bg-[#2D2159] text-white" : "bg-gray-100 text-gray-500")}>
                        <type.icon size={20} />
                      </div>
                      <span className={cn("font-bold mb-1", role === type.id ? "text-[#2D2159]" : "text-gray-900")}>{type.label}</span>
                      <span className="text-xs text-gray-500 leading-relaxed">{type.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
                <input
                  type="checkbox"
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  disabled={!canAccept}
                />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-[#2D2159] mb-3">
                    I agree to the <a href="#" onClick={openTerms} className="underline hover:text-primary transition-colors">Terms of Use and Privacy Policy</a>
                    {terms && <span className="text-gray-400 font-normal"> (v{terms.version})</span>}.
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    {termsOpened ? <CheckCircle2 size={14} className="text-green-500" /> : <Circle size={14} className="text-gray-300" />}
                    {termsLoading ? 'Loading terms…' : 'Terms opened'}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="space-y-4 pt-2">
                <Button
                  type="submit"
                  size="lg"
                  className={cn(
                    "w-full py-6 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2",
                    termsAccepted ? "bg-[#9A7DCA] hover:bg-[#8565b8] text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  )}
                  disabled={!termsAccepted || registerMutation.isPending}
                >
                  {registerMutation.isPending && <Loader2 size={18} className="animate-spin" />}
                  Create account
                </Button>
                <p className="text-center text-sm text-gray-500">
                  Already a member? <Link to="/login" className="text-[#2D2159] font-bold hover:underline">Log in</Link>
                </p>
              </div>

            </form>
          </div>
        </div>
      </div>

      {/* Legal Modal */}
      <Modal isOpen={termsModalOpen} onClose={() => setTermsModalOpen(false)} title={`Terms of Use & Privacy Policy${terms ? ` (v${terms.version})` : ''}`} className="max-w-2xl">
        <div className="prose prose-sm prose-purple whitespace-pre-wrap">
          {terms?.body ?? 'Loading…'}
        </div>
        <div className="mt-8 flex justify-end">
          <Button onClick={() => setTermsModalOpen(false)}>I understand</Button>
        </div>
      </Modal>
    </PageTransition>
  );
}
