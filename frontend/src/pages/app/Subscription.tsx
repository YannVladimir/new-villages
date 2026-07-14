import { useState, useEffect } from 'react';
import { Check, Zap, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { toast } from '../../store/useToastStore';
import { PageTransition } from '../../components/ui/PageTransition';

export function Subscription() {
  const [selected, setSelected] = useState('leader');
  const [checkout, setCheckout] = useState(false);
  const [success, setSuccess] = useState(false);

  const plans = [
    {
      id: 'free', 
      label: 'Member', 
      price: 'Free', 
      period: '', 
      tag: 'Join and connect',
      features: ['Unlimited communities', 'RSVP to events', 'Direct messages', 'Notifications']
    },
    {
      id: 'leader', 
      label: 'Community Leader', 
      price: '$10', 
      period: '/month', 
      tag: 'Most popular',
      features: ['All Member features', 'Create & manage a community', 'Publish announcements & events', 'Basic analytics']
    },
    {
      id: 'org', 
      label: 'Organization', 
      price: '$20', 
      period: '/month', 
      tag: 'For businesses & nonprofits',
      features: ['All Leader features', 'Verified org page', 'Contact communities directly', 'Team seats']
    },
  ];

  const selectedPlan = plans.find(p => p.id === selected)!;

  useEffect(() => {
    if (success) {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      toast.success(`Welcome to the ${selectedPlan.label} tier!`);
    }
  }, [success, selectedPlan.label]);

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6 bg-[#F6F5FB]">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-sm bg-white p-10 rounded-3xl shadow-xl">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-heading font-bold mb-2 text-[#2D2159]">You're all set! 🎉</h2>
          <p className="text-gray-600 mb-8 font-medium">Welcome to the <strong>{selectedPlan.label}</strong> plan. Your new features are active immediately.</p>
          <Button className="w-full py-6 rounded-full bg-[#2D2159] hover:bg-[#3F2A78] text-white font-bold" onClick={() => { setSuccess(false); setCheckout(false); }}>
            Back to Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F6F5FB] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatePresence mode="wait">
            {!checkout ? (
              <motion.div key="plans" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="text-center mb-16">
                  <div className="text-primary text-[11px] font-bold tracking-widest uppercase mb-3">Simple Pricing</div>
                  <h2 className="text-3xl md:text-5xl font-heading font-extrabold text-[#2D2159]">Free for members, built to grow.</h2>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
                  {/* Free */}
                  <Card 
                    className={cn("p-8 border-2 rounded-3xl bg-white shadow-sm cursor-pointer transition-all", selected === 'free' ? 'border-[#2D2159]' : 'border-gray-200 hover:border-gray-300')}
                    onClick={() => setSelected('free')}
                  >
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">{plans[0].tag}</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plans[0].label}</h3>
                    <div className="text-4xl font-extrabold text-gray-900 mb-8">{plans[0].price}</div>
                    <ul className="space-y-4 mb-8">
                      {plans[0].features.map((f, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                          <Check size={16} className="text-green-500"/> {f}
                        </li>
                      ))}
                    </ul>
                    <Button variant={selected === 'free' ? 'primary' : 'outline'} className={cn("w-full py-6 rounded-full font-bold transition-colors", selected === 'free' ? 'bg-[#2D2159] text-white hover:bg-[#3F2A78]' : 'border-2 border-[#2D2159] text-[#2D2159] hover:bg-[#2D2159] hover:text-white')}>
                      {selected === 'free' ? 'Current Plan' : 'Select'}
                    </Button>
                  </Card>

                  {/* Leader (Purple) */}
                  <Card 
                    className={cn("p-8 border-none rounded-3xl text-white shadow-xl relative scale-100 md:scale-105 z-10 cursor-pointer transition-all", selected === 'leader' ? 'bg-[#3F2A78] ring-4 ring-primary/30' : 'bg-[#2D2159]')}
                    onClick={() => setSelected('leader')}
                  >
                    <div className="text-[10px] font-bold text-primary-200 uppercase tracking-widest mb-4">{plans[1].tag}</div>
                    <h3 className="text-2xl font-bold mb-2">{plans[1].label}</h3>
                    <div className="flex items-end gap-1 mb-8">
                      <span className="text-4xl font-extrabold">{plans[1].price}</span>
                      <span className="text-primary-200 text-sm mb-1">{plans[1].period}</span>
                    </div>
                    <ul className="space-y-4 mb-8">
                      {plans[1].features.map((f, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-primary-100">
                          <Check size={16} className="text-green-400"/> {f}
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full py-6 rounded-full bg-white text-[#2D2159] hover:bg-gray-50 font-bold transition-colors" onClick={(e) => { e.stopPropagation(); setCheckout(true); }}>
                      Upgrade to Leader
                    </Button>
                  </Card>

                  {/* Org */}
                  <Card 
                    className={cn("p-8 border-2 rounded-3xl bg-white shadow-sm cursor-pointer transition-all", selected === 'org' ? 'border-[#2D2159]' : 'border-gray-200 hover:border-gray-300')}
                    onClick={() => setSelected('org')}
                  >
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">{plans[2].tag}</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plans[2].label}</h3>
                    <div className="flex items-end gap-1 mb-8">
                      <span className="text-4xl font-extrabold text-gray-900">{plans[2].price}</span>
                      <span className="text-gray-500 text-sm mb-1">{plans[2].period}</span>
                    </div>
                    <ul className="space-y-4 mb-8">
                      {plans[2].features.map((f, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                          <Check size={16} className="text-green-500"/> {f}
                        </li>
                      ))}
                    </ul>
                    <Button variant={selected === 'org' ? 'primary' : 'outline'} className={cn("w-full py-6 rounded-full font-bold transition-colors", selected === 'org' ? 'bg-[#2D2159] text-white hover:bg-[#3F2A78]' : 'border-2 border-[#2D2159] text-[#2D2159] hover:bg-[#2D2159] hover:text-white')} onClick={(e) => { e.stopPropagation(); setCheckout(true); }}>
                      Upgrade to Organization
                    </Button>
                  </Card>
                </div>
              </motion.div>
            ) : (
              <motion.div key="checkout" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-md mx-auto mt-8">
                <Button variant="ghost" className="mb-6 hover:bg-transparent px-0 font-semibold text-[#2D2159]" onClick={() => setCheckout(false)}>
                  <ArrowLeft size={16} className="mr-2" /> Back to Plans
                </Button>
                <Card className="rounded-3xl border-gray-100 shadow-xl overflow-hidden">
                  <div className="bg-[#2D2159] text-white p-6">
                    <div className="text-xs font-bold text-primary-200 uppercase tracking-widest mb-1">Upgrading to</div>
                    <div className="flex justify-between items-end">
                      <span className="text-xl font-bold">{selectedPlan.label}</span>
                      <span className="font-extrabold text-3xl">{selectedPlan.price}<span className="text-sm font-normal opacity-80">{selectedPlan.period}</span></span>
                    </div>
                  </div>
                  <CardContent className="p-8 space-y-6">
                    <div className="space-y-4">
                      <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Cardholder Name</label><Input placeholder="Jane Doe" className="bg-gray-50 border-gray-200 rounded-xl py-5" required /></div>
                      <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Card Number</label><Input placeholder="4242 4242 4242 4242" className="bg-gray-50 border-gray-200 rounded-xl py-5" required /></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-bold text-gray-700 mb-1.5">Expiry</label><Input placeholder="MM/YY" className="bg-gray-50 border-gray-200 rounded-xl py-5" required /></div>
                        <div><label className="block text-sm font-bold text-gray-700 mb-1.5">CVC</label><Input placeholder="•••" className="bg-gray-50 border-gray-200 rounded-xl py-5" required /></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#2D2159] bg-[#F2F0FA] rounded-xl p-4">
                      <Zap size={14} className="text-primary" />
                      This is a demo checkout. No real payment will be processed.
                    </div>
                    <Button className="w-full py-6 rounded-full bg-[#2D2159] hover:bg-[#3F2A78] font-bold text-lg" onClick={() => setSuccess(true)}>
                      Pay {selectedPlan.price}{selectedPlan.period}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
export default Subscription;
