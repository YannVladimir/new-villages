import { Link } from 'react-router-dom';
import { motion, useInView, animate } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Users, Globe, Calendar, ArrowRight, Check, Shield } from 'lucide-react';
import { Card } from '../../components/ui/Card';

const featuredCommunities = [
  { name: 'Toronto Newcomers Circle', members: '1,284 members', color: 'text-red-500 bg-red-50', icon: '🍁' },
  { name: 'GTA Tech Founders', members: '892 members', color: 'text-green-500 bg-green-50', icon: '💻' },
  { name: 'Filipino Heritage Club', members: '546 members', color: 'text-purple-500 bg-purple-50', icon: '👥' },
  { name: 'Caregivers of Ontario', members: '421 members', color: 'text-pink-500 bg-pink-50', icon: '🤍' },
  { name: 'New Grads Toronto', members: '733 members', color: 'text-orange-500 bg-orange-50', icon: '🎓' },
  { name: 'York Region Book Club', members: '218 members', color: 'text-teal-500 bg-teal-50', icon: '📖' },
  { name: 'Muslim Women Professionals', members: '612 members', color: 'text-fuchsia-500 bg-fuchsia-50', icon: '🧕' },
  { name: 'Ontario Newcomer Dads', members: '189 members', color: 'text-blue-500 bg-blue-50', icon: '👨‍👧' },
];

function AnimatedCounter({ from = 0, to, duration = 2, suffix = '+' }: { from?: number; to: number; duration?: number, suffix?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState(from.toLocaleString());

  useEffect(() => {
    if (isInView) {
      const controls = animate(from, to, {
        duration,
        onUpdate: (value) => {
          setDisplayValue(Math.round(value).toLocaleString());
        }
      });
      return () => controls.stop();
    }
  }, [isInView, from, to, duration]);

  return <div ref={ref} className="text-4xl md:text-5xl font-bold font-heading mb-1 text-primary-900">{displayValue}{suffix}</div>;
}

export function Landing() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 pt-12 pb-24 md:pt-20 md:pb-32 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        <div className="flex-1 text-left z-10 space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 text-primary text-xs font-semibold mb-6 tracking-wide uppercase">
              <span className="text-red-500 text-sm">🍁</span> Made in Canada • Since 2026
            </div>
            <h1 className="text-5xl md:text-7xl font-heading font-extrabold text-[#2D2159] leading-[1.1] mb-6">
              Connect.<br/>Collaborate.<br/><span className="text-primary">Grow together.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-lg leading-relaxed">
              NewVillages is where Canadians build real community — from newcomer circles to founder collectives, cultural clubs to caregiver support.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto px-8 py-6 rounded-full text-base flex items-center justify-center gap-2">
                  Get started free <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-6 rounded-full text-base border-gray-200 text-gray-700 hover:bg-gray-50">
                  Log in
                </Button>
              </Link>
            </div>
            
            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-3">
                <img src="https://i.pravatar.cc/100?u=10" className="w-10 h-10 rounded-full border-2 border-white bg-primary" alt=""/>
                <img src="https://i.pravatar.cc/100?u=11" className="w-10 h-10 rounded-full border-2 border-white bg-blue-500" alt=""/>
                <img src="https://i.pravatar.cc/100?u=12" className="w-10 h-10 rounded-full border-2 border-white bg-green-500" alt=""/>
                <img src="https://i.pravatar.cc/100?u=13" className="w-10 h-10 rounded-full border-2 border-white bg-orange-500" alt=""/>
              </div>
              <div className="text-sm text-gray-600 font-medium">
                <span className="font-bold text-gray-900">12,000+ members</span> across <span className="font-bold text-gray-900">300+ circles</span>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="flex-1 relative w-full max-w-lg lg:max-w-none mx-auto">
           <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[4/5] bg-gray-100"
           >
              <img 
                src="https://images.unsplash.com/photo-1503756234508-e32369269deb?auto=format&fit=crop&w=1200&q=80" 
                alt="Toronto Skyline" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Floating Card inside Hero Image */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm p-5 rounded-2xl shadow-xl">
                <div className="text-[10px] font-bold tracking-wider text-primary uppercase mb-1">Featured Circle</div>
                <div className="font-bold text-gray-900 mb-3 text-lg">Toronto Newcomers Circle</div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-start gap-3">
                  <div className="bg-primary/10 text-primary p-2 rounded-lg"><Calendar size={18}/></div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase">Upcoming</div>
                    <div className="font-bold text-gray-900 text-sm">Winter Coats Drive</div>
                    <div className="text-xs text-gray-500">Sat, Oct 19 • Regent Park</div>
                  </div>
                </div>
              </div>
           </motion.div>
        </div>
      </section>

      {/* Stats Band */}
      <section className="bg-gray-50 py-16 border-y border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-200/50">
          <div className="px-4">
            <AnimatedCounter to={12483} duration={2.5} />
            <div className="text-gray-500 text-[11px] font-bold uppercase tracking-widest mt-2">Members</div>
          </div>
          <div className="px-4">
            <AnimatedCounter to={312} duration={2} />
            <div className="text-gray-500 text-[11px] font-bold uppercase tracking-widest mt-2">Communities</div>
          </div>
          <div className="px-4 border-t md:border-t-0 pt-8 md:pt-0">
            <AnimatedCounter to={68} duration={1.5} suffix="" />
            <div className="text-gray-500 text-[11px] font-bold uppercase tracking-widest mt-2">Cities</div>
          </div>
          <div className="px-4 border-t md:border-t-0 pt-8 md:pt-0">
            <AnimatedCounter to={4890} duration={2} />
            <div className="text-gray-500 text-[11px] font-bold uppercase tracking-widest mt-2">Events Hosted</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="text-primary text-[11px] font-bold tracking-widest uppercase mb-3">How it works</div>
            <h2 className="text-3xl md:text-5xl font-heading font-extrabold text-gray-900">Three steps to your village</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-10">
            {[
              { icon: Users, title: 'Find your people', desc: 'Search by cause, culture, or career. Every circle is a real, moderated community.' },
              { icon: Calendar, title: 'Show up together', desc: 'RSVP to dinners, workshops, and support meetings — online or across the country.' },
              { icon: Globe, title: 'Grow the village', desc: 'Start your own circle, publish announcements, and mentor the next wave.' }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
              >
                <Card className="text-left p-8 bg-white h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                    <step.icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{step.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">{step.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Circles */}
      <section className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4"
          >
            <div>
              <div className="text-primary text-[11px] font-bold tracking-widest uppercase mb-3">Featured Circles</div>
              <h2 className="text-3xl md:text-5xl font-heading font-extrabold text-gray-900">Real communities, real people</h2>
            </div>
            <Link to="/communities" className="text-primary font-semibold text-sm hover:underline flex items-center gap-1">
              Browse all <ArrowRight size={16} />
            </Link>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredCommunities.map((cat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Card className="p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/30 transition-all rounded-2xl cursor-pointer bg-white group h-full flex flex-col justify-between">
                  <div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${cat.color} group-hover:scale-110 transition-transform`}>
                      <span className="text-xl">{cat.icon}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1 leading-tight">{cat.name}</h3>
                  </div>
                  <p className="text-gray-400 text-xs mt-4">{cat.members}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Simple Pricing */}
      <section className="py-24 md:py-32 bg-white border-t border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="text-center mb-16">
            <div className="text-primary text-[11px] font-bold tracking-widest uppercase mb-3">Simple Pricing</div>
            <h2 className="text-3xl md:text-5xl font-heading font-extrabold text-gray-900">Free for members, built to grow.</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
            {/* Free */}
            <Card className="p-8 border border-gray-200 rounded-3xl bg-white shadow-sm">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Join and connect</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Member</h3>
              <div className="text-4xl font-extrabold text-gray-900 mb-8">Free</div>
              <ul className="space-y-4 mb-8">
                {['Unlimited communities', 'RSVP to events', 'Direct messages', 'Notifications'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                    <Check size={16} className="text-gray-400"/> {f}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full py-6 rounded-full border-2 border-[#2D2159] text-[#2D2159] hover:bg-[#2D2159] hover:text-white font-bold transition-colors">
                Get started
              </Button>
            </Card>

            {/* Leader (Purple) */}
            <Card className="p-8 border-none rounded-3xl bg-[#2D2159] text-white shadow-xl relative scale-100 md:scale-105 z-10">
              <div className="text-[10px] font-bold text-primary-200 uppercase tracking-widest mb-4">Most popular</div>
              <h3 className="text-2xl font-bold mb-2">Community Leader</h3>
              <div className="flex items-end gap-1 mb-8">
                <span className="text-4xl font-extrabold">$10</span>
                <span className="text-primary-200 text-sm mb-1">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                {['All Member features', 'Create & manage a community', 'Publish announcements & events', 'Basic analytics'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-primary-100">
                    <Check size={16} className="text-primary-300"/> {f}
                  </li>
                ))}
              </ul>
              <Button className="w-full py-6 rounded-full bg-white text-[#2D2159] hover:bg-gray-50 font-bold transition-colors">
                Get started
              </Button>
            </Card>

            {/* Org */}
            <Card className="p-8 border border-gray-200 rounded-3xl bg-white shadow-sm">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">For businesses & nonprofits</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Organization</h3>
              <div className="flex items-end gap-1 mb-8">
                <span className="text-4xl font-extrabold text-gray-900">$20</span>
                <span className="text-gray-500 text-sm mb-1">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                {['All Leader features', 'Verified org page', 'Contact communities directly', 'Team seats'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                    <Check size={16} className="text-gray-400"/> {f}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full py-6 rounded-full border-2 border-[#2D2159] text-[#2D2159] hover:bg-[#2D2159] hover:text-white font-bold transition-colors">
                Get started
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Footer Block */}
      <section className="bg-[#3F2A78] text-white py-16 md:py-20 px-6">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-primary-200 text-xs font-bold uppercase tracking-widest mb-4">
              <Shield size={16} /> Built on trust
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold mb-4">Safe, moderated, Canadian-owned.</h2>
            <p className="text-primary-100 text-sm leading-relaxed">
              Real names, real moderation, and a clear Terms of Use every member signs. Because a village only works when everyone belongs.
            </p>
          </div>
          <Button className="bg-white text-[#3F2A78] hover:bg-gray-100 rounded-full px-8 py-6 whitespace-nowrap font-bold flex items-center gap-2 shrink-0">
            Join NewVillages <ArrowRight size={16} />
          </Button>
        </div>
      </section>

      {/* Footer Nav */}
      <footer className="bg-white py-8 border-t border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.jpeg" alt="NewVillages" className="w-8 h-8 rounded-full object-contain" />
            <span className="font-heading font-bold text-gray-900">NewVillages</span>
            <span className="text-[10px] text-gray-400 ml-1">MADE IN CANADA</span>
          </Link>
          
          <div className="flex gap-6 text-sm font-medium text-gray-500">
            <Link to="/terms" className="hover:text-gray-900 transition-colors">Terms of Use</Link>
            <Link to="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
            <a href="mailto:contact@onevillage.ca" className="hover:text-gray-900 transition-colors">Contact</a>
            <span className="flex items-center gap-1 text-red-500"><span className="text-xs">🍁</span> Made in Canada</span>
          </div>
          
          <div className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} NewVillages Inc.
          </div>
        </div>
      </footer>
    </div>
  );
}
