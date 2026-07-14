import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { useAcceptTerms, useCurrentTerms } from '../../hooks/useAuth';
import { Loader2 } from 'lucide-react';

export function ReConsent() {
  const navigate = useNavigate();
  const { data: terms, isLoading } = useCurrentTerms();
  const acceptTerms = useAcceptTerms();

  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [hasViewedTerms, setHasViewedTerms] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accepted && terms) {
      acceptTerms.mutate(terms.version, { onSuccess: () => navigate('/dashboard') });
    }
  };

  return (
    <div className="min-h-screen bg-background-light py-12 px-4 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <span className="text-4xl">⚖️</span>
            <h1 className="text-2xl font-heading font-bold mt-4 mb-2">Terms Updated</h1>
            <p className="text-sm text-gray-600">
              We have updated our Terms of Use and Privacy Policy{terms ? ` (v${terms.version})` : ''}. Please review and accept them to continue using OneVillage.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-t border-gray-150 pt-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary disabled:opacity-50"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  disabled={!hasViewedTerms}
                />
                <span className="text-sm text-gray-700">
                  I agree to the updated{' '}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setTermsModalOpen(true);
                      setHasViewedTerms(true);
                    }}
                    className="text-primary hover:underline font-semibold"
                  >
                    Terms of Use and Privacy Policy
                  </a>.
                </span>
              </label>
              {!hasViewedTerms && (
                <p className="text-xs text-red-500 mt-1 pl-8">
                  You must open and review the document before accepting.
                </p>
              )}
            </div>

            <Button type="submit" size="lg" className="w-full flex items-center justify-center gap-2" disabled={!accepted || acceptTerms.isPending}>
              {acceptTerms.isPending && <Loader2 size={18} className="animate-spin" />}
              Accept and Continue
            </Button>
          </form>
        </CardContent>
      </Card>

      <Modal isOpen={termsModalOpen} onClose={() => setTermsModalOpen(false)} title={`Terms of Use & Privacy Policy${terms ? ` (v${terms.version})` : ''}`} className="max-w-2xl">
        <div className="prose prose-sm prose-purple whitespace-pre-wrap">
          {isLoading ? 'Loading…' : terms?.body}
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={() => setTermsModalOpen(false)}>I have reviewed the terms</Button>
        </div>
      </Modal>
    </div>
  );
}
