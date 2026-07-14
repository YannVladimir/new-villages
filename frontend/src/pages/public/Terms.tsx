import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageTransition } from '../../components/ui/PageTransition';

export function Terms() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-white">
        {/* Header Hero */}
        <div className="bg-[#F2F0FA] py-16 md:py-24 border-b border-[#E5E2F3]">
          <div className="max-w-3xl mx-auto px-6">
            <Link to="/" className="inline-flex items-center text-[#3F2A78] font-semibold hover:underline mb-8">
              <ArrowLeft size={16} className="mr-2" /> Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-[#2D2159] mb-4">Terms of Use</h1>
            <p className="text-[#3F2A78]/80 font-medium">Version 1.0.0 &middot; Last updated: October 24, 2026</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-6 py-16">
          <article className="prose prose-lg prose-purple max-w-none text-gray-700">
            <h3 className="text-[#2D2159] font-bold text-2xl mt-8 mb-4">1. Acceptance of Terms</h3>
            <p className="mb-6 leading-relaxed">By accessing and using NewVillages, you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our platform.</p>
            
            <h3 className="text-[#2D2159] font-bold text-2xl mt-8 mb-4">2. User Accounts</h3>
            <p className="mb-6 leading-relaxed">You must provide accurate information when creating an account. You are responsible for maintaining the security of your password and account.</p>
            
            <h3 className="text-[#2D2159] font-bold text-2xl mt-8 mb-4">3. Community Guidelines</h3>
            <p className="mb-6 leading-relaxed">NewVillages is built on respect. Harassment, hate speech, spam, and illegal content will result in immediate account termination.</p>
            
            <h3 className="text-[#2D2159] font-bold text-2xl mt-8 mb-4">4. Content Ownership</h3>
            <p className="mb-6 leading-relaxed">You retain ownership of the content you post, but grant NewVillages a license to display and distribute it within the platform.</p>
            
            <h3 className="text-[#2D2159] font-bold text-2xl mt-8 mb-4">5. Termination</h3>
            <p className="mb-6 leading-relaxed">We reserve the right to suspend or terminate accounts that violate these Terms, at our sole discretion.</p>
          </article>
        </div>
      </div>
    </PageTransition>
  );
}
