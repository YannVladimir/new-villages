import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageTransition } from '../../components/ui/PageTransition';

export function Privacy() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-white">
        {/* Header Hero */}
        <div className="bg-[#F2F0FA] py-16 md:py-24 border-b border-[#E5E2F3]">
          <div className="max-w-3xl mx-auto px-6">
            <Link to="/" className="inline-flex items-center text-[#3F2A78] font-semibold hover:underline mb-8">
              <ArrowLeft size={16} className="mr-2" /> Back to Home
            </Link>
            <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-[#2D2159] mb-4">Privacy Policy</h1>
            <p className="text-[#3F2A78]/80 font-medium">Version 1.0.0 &middot; Last updated: October 24, 2026</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-6 py-16">
          <article className="prose prose-lg prose-purple max-w-none text-gray-700">
            <h3 className="text-[#2D2159] font-bold text-2xl mt-8 mb-4">1. Information We Collect</h3>
            <p className="mb-6 leading-relaxed">We collect information you provide directly to us when you create an account, update your profile, or interact with communities. This includes your name, email, and location data.</p>
            
            <h3 className="text-[#2D2159] font-bold text-2xl mt-8 mb-4">2. How We Use Your Information</h3>
            <p className="mb-6 leading-relaxed">We use the information we collect to provide, maintain, and improve our services, as well as to personalize your experience and connect you with relevant communities.</p>
            
            <h3 className="text-[#2D2159] font-bold text-2xl mt-8 mb-4">3. Information Sharing</h3>
            <p className="mb-6 leading-relaxed">We do not sell your personal data. We may share information with service providers who assist us in operating our platform, subject to strict confidentiality agreements.</p>
            
            <h3 className="text-[#2D2159] font-bold text-2xl mt-8 mb-4">4. Your Rights</h3>
            <p className="mb-6 leading-relaxed">You have the right to access, correct, or delete your personal data at any time. You can manage your privacy preferences in your account settings.</p>
            
            <h3 className="text-[#2D2159] font-bold text-2xl mt-8 mb-4">5. Security</h3>
            <p className="mb-6 leading-relaxed">We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, or destruction.</p>
          </article>
        </div>
      </div>
    </PageTransition>
  );
}
