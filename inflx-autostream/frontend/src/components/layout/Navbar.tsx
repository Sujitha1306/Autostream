import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Menu, X, Activity } from 'lucide-react';
import { checkHealth } from '../../api/client';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/chat', label: 'AI Agent' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/docs', label: 'Docs' },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    checkHealth().then(setBackendOnline);
    const interval = setInterval(() => checkHealth().then(setBackendOnline), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0A0A0F]/95 backdrop-blur-md border-b border-[#2A2A3A] shadow-xl'
          : 'bg-transparent border-b border-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="leading-none">
              <span className="text-white font-bold text-base tracking-tight">Inflx</span>
              <span className="text-indigo-400 text-xs block font-medium -mt-0.5">by AutoStream</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = location.pathname === href;
              return (
                <Link
                  key={href}
                  to={href}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-white/10 rounded-lg"
                      transition={{ type: 'spring', duration: 0.4 }}
                    />
                  )}
                  <span className="relative">{label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Backend Status */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#111118] border border-[#2A2A3A]">
              <div className={`w-1.5 h-1.5 rounded-full ${
                backendOnline === null ? 'bg-slate-500 animate-pulse' :
                backendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
              }`} />
              <span className="text-xs text-slate-500">
                {backendOnline === null ? 'Connecting...' : backendOnline ? 'API Online' : 'API Offline'}
              </span>
            </div>

            <Link
              to="/chat"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all shadow-lg shadow-indigo-500/20"
            >
              <Activity className="w-3.5 h-3.5" /> Try the Agent
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 bg-[#0A0A0F]/98 backdrop-blur-md border-b border-[#2A2A3A] md:hidden"
          >
            <div className="max-w-7xl mx-auto px-6 py-4 space-y-1">
              {NAV_LINKS.map(({ href, label }) => {
                const isActive = location.pathname === href;
                return (
                  <Link
                    key={href}
                    to={href}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
              <div className="pt-2">
                <Link
                  to="/chat"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-indigo-600 text-white text-sm font-medium"
                >
                  <Activity className="w-4 h-4" /> Try the Agent
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
