import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, PlusCircle, MessageSquare, UserCircle, Bell, Search, Settings, Shield, LogOut, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { useLogout } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationsDrawer } from '../components/ui/NotificationsDrawer';
import { ToastContainer } from '../components/ui/ToastContainer';
import { AnimatePresence, motion } from 'framer-motion';

export function Layout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const currentUser = useStore((s) => s.currentUser);
  const logout = useLogout();
  const role = currentUser?.role ?? 'guest';

  const handleLogout = () => {
    logout.mutate(undefined, { onSuccess: () => navigate('/login') });
  };

  const { data: notificationsPage } = useNotifications(0, 20);
  const hasUnread = (notificationsPage?.content ?? []).some((n) => !n.isRead);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close profile menu on route change
  useEffect(() => {
    setIsProfileMenuOpen(false);
  }, [pathname]);

  const mainNavItems = [
    { label: 'Home', icon: Home, href: '/' },
    { label: 'Communities', icon: Users, href: '/communities' },
    { label: 'Messages', icon: MessageSquare, href: '/messages' },
  ];

  // Role specific links to show in main nav
  if (role === 'COMMUNITY_LEADER') {
    mainNavItems.push({ label: 'Leader Portal', icon: Shield, href: '/leader-dashboard' });
  } else if (role === 'ORGANIZATION') {
    mainNavItems.push({ label: 'Org Page', icon: Users, href: '/org/me' });
  } else if (role === 'ADMIN') {
    mainNavItems.push({ label: 'Admin Panel', icon: Shield, href: '/admin' });
  }

  const mobileNavItems = [
    { label: 'Home', icon: Home, href: '/' },
    { label: 'Communities', icon: Users, href: '/communities' },
    { label: 'Create', icon: PlusCircle, href: '/create-community', isAction: true },
    { label: 'Messages', icon: MessageSquare, href: '/messages' },
    { label: 'Profile', icon: UserCircle, href: '/profile' },
  ];

  const Logo = () => (
    <Link to="/" className="flex items-center gap-2 lg:gap-3 shrink-0">
      <img src="/logo.jpeg" alt="NewVillages Logo" className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-contain bg-white" />
      <div className="hidden sm:block">
        <span className="font-heading font-bold text-base lg:text-lg text-primary leading-none block">NewVillages</span>
      </div>
    </Link>
  );

  const isAuthPage = ['/register', '/login', '/verify-email', '/onboarding', '/forgot-password', '/reset-password'].includes(pathname);

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-[#F6F5FB] flex flex-col">
        <main className="flex-1 w-full">
          <Outlet />
        </main>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      {/* Desktop Top Navigation Bar */}
      <header className="hidden md:flex h-16 bg-white border-b border-gray-200 items-center justify-between px-4 lg:px-8 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-8">
          <Logo />
          
          {/* Main Navigation Links */}
          <nav className="flex items-center gap-1">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'px-4 py-2 rounded-full font-medium transition-all duration-200 text-sm',
                    isActive ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3 lg:gap-5">
          {/* Global Search */}
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-48 lg:w-64 transition-all focus-within:w-64 lg:focus-within:w-80 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 focus-within:shadow-sm">
            <Search size={16} className="text-gray-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none focus:outline-none text-sm w-full"
            />
          </div>

          {/* Quick Create CTA */}
          <Link
            to="/create-community"
            className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors font-medium text-sm"
          >
            <PlusCircle size={16} />
            <span>Create</span>
          </Link>

          <div className="h-6 w-px bg-gray-200 mx-1 hidden lg:block" />

          {/* Notifications */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative p-2 text-gray-500 hover:bg-gray-100 hover:text-primary rounded-full transition-colors"
          >
            <Bell size={20} />
            {hasUnread && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
          </button>

          {/* User Profile Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button 
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 hover:bg-gray-50 rounded-full pl-1 pr-2 py-1 transition-colors border border-transparent hover:border-gray-200"
            >
              <img src={currentUser?.avatarUrl || "https://i.pravatar.cc/150?u=1"} className="w-8 h-8 rounded-full border border-gray-200" alt="avatar" />
              <ChevronDown size={14} className="text-gray-500" />
            </button>

            <AnimatePresence>
              {isProfileMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 origin-top-right"
                >
                  <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                    <p className="font-semibold text-gray-900 truncate">{currentUser?.fullName || 'Guest User'}</p>
                    <p className="text-xs text-gray-500 capitalize mt-0.5">{role.toLowerCase().replace('_', ' ')}</p>
                  </div>
                  <div className="p-2 space-y-1">
                    <Link to="/profile" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors">
                      <UserCircle size={16} /> My Profile
                    </Link>
                    <Link to="/settings" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors">
                      <Settings size={16} /> Settings
                    </Link>
                  </div>
                  <div className="p-2 border-t border-gray-50">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left">
                      <LogOut size={16} /> Log Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Mobile Topbar */}
      <header className="md:hidden flex h-14 bg-white border-b border-gray-200 items-center justify-between px-4 sticky top-0 z-40">
        <Logo />
        <div className="flex items-center gap-3">
          <button className="p-1 text-gray-500"><Search size={20} /></button>
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative p-1 text-gray-500"
          >
            <Bell size={20} />
            {hasUnread && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-white"></span>}
          </button>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 w-full pb-20 md:pb-8">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex items-center justify-around px-2 z-50 pb-safe">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <div key={item.href} className="relative -top-5">
                <Link to={item.href} className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg hover:bg-primary-hover transition-colors">
                  <Icon size={24} />
                </Link>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors', 
                isActive ? 'text-primary' : 'text-gray-400'
              )}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Notifications Drawer */}
      <NotificationsDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
