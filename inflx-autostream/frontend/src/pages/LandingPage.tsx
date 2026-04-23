import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, BarChart3, Users, Shield, CheckCircle2,
  ArrowRight, Sparkles, Play, Star
} from 'lucide-react';

const FEATURES = [
  {
    icon: Zap,
    title: 'AI-Powered Intent Detection',
    desc: 'Every message is classified in real time — the agent always knows if you\'re browsing, researching, or ready to buy.',
    color: 'text-indigo-400 bg-indigo-500/10',
  },
  {
    icon: Sparkles,
    title: 'RAG Knowledge Base',
    desc: 'Answers grounded exclusively in verified product data — no hallucinations, no made-up pricing.',
    color: 'text-violet-400 bg-violet-500/10',
  },
  {
    icon: Users,
    title: 'Smart Lead Capture',
    desc: 'Collects name, email, and creator platform in a natural conversation — no forms, no friction.',
    color: 'text-emerald-400 bg-emerald-500/10',
  },
  {
    icon: BarChart3,
    title: 'Live Analytics Dashboard',
    desc: 'Real-time leads table, platform breakdown, and conversion metrics — all in one panel.',
    color: 'text-amber-400 bg-amber-500/10',
  },
  {
    icon: Shield,
    title: 'Stateful Multi-Turn Memory',
    desc: 'The agent remembers every detail across the conversation. No repetitive questions.',
    color: 'text-cyan-400 bg-cyan-500/10',
  },
  {
    icon: Play,
    title: 'WhatsApp Deployment Ready',
    desc: 'Documented webhook integration strategy for Twilio and Meta Graph API deployment.',
    color: 'text-pink-400 bg-pink-500/10',
  },
];

const PRICING = [
  {
    name: 'Basic',
    price: '$29',
    period: '/month',
    desc: 'Perfect for individual creators getting started.',
    features: [
      '10 videos per month',
      '720p resolution',
      'Auto-cut & silence removal',
      'Basic transitions library',
      'Email support',
      '1 user seat · 5 GB storage',
    ],
    cta: 'Get Started',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$79',
    period: '/month',
    desc: 'For serious creators who want unlimited power.',
    badge: 'Most Popular',
    features: [
      'Unlimited videos',
      '4K Ultra HD resolution',
      'AI Captions (95% accuracy)',
      'Brand kit + API access',
      '24/7 live chat & phone support',
      '5 seats · 100 GB storage',
    ],
    cta: 'Start Free Trial',
    highlight: true,
  },
];

const TESTIMONIALS = [
  { name: 'Sarah K.', role: 'YouTube Creator · 280K subs', quote: 'Switched from manual editing to AutoStream Pro. Saves me 12 hours a week.', stars: 5 },
  { name: 'Marcus T.', role: 'TikTok Creator · 1.2M followers', quote: 'AI captions alone are worth the $79. My engagement went up 40%.', stars: 5 },
  { name: 'Priya R.', role: 'Instagram Reels Creator', quote: 'The brand kit feature is a game-changer. Every video looks like it came from the same studio.', stars: 5 },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white overflow-hidden">

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-medium mb-6"
          >
            <Zap className="w-3 h-3" /> AI-Powered Social-to-Lead Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6"
          >
            Convert Social Conversations
            <br />
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Into Qualified Leads
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Inflx is AutoStream's agentic AI platform — it classifies intent, retrieves accurate product knowledge,
            and captures qualified leads through natural conversation. No forms. No friction.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link
              to="/chat"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-xl shadow-indigo-500/20"
            >
              <Sparkles className="w-4 h-4" /> Try the AI Agent
            </Link>
            <Link
              to="/dashboard"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-[#2A2A3A] bg-[#111118] text-slate-300 hover:text-white hover:border-indigo-500/40 font-semibold text-sm transition-all"
            >
              <BarChart3 className="w-4 h-4" /> View Dashboard
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-white text-3xl font-bold mb-3">Everything a Modern Lead Agent Needs</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Built on LangGraph + Gemini — with real-time state, RAG retrieval, and a polished UI.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="p-5 rounded-2xl bg-[#111118] border border-[#2A2A3A] hover:border-indigo-500/30 transition-all group"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-white font-semibold mb-2 text-sm">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 border-t border-[#2A2A3A]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-white text-3xl font-bold mb-3">Simple, Transparent Pricing</h2>
            <p className="text-slate-400 text-sm">No hidden fees. Cancel any time.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PRICING.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative p-6 rounded-2xl border ${
                  plan.highlight
                    ? 'bg-gradient-to-b from-indigo-500/10 to-[#111118] border-indigo-500/40'
                    : 'bg-[#111118] border-[#2A2A3A]'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-semibold">
                    {plan.badge}
                  </div>
                )}
                <h3 className="text-white font-bold text-lg mb-1">{plan.name}</h3>
                <p className="text-slate-500 text-xs mb-4">{plan.desc}</p>
                <div className="flex items-end gap-1 mb-5">
                  <span className="text-white text-4xl font-extrabold">{plan.price}</span>
                  <span className="text-slate-500 text-sm mb-1">{plan.period}</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/chat"
                  className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    plan.highlight
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                      : 'bg-[#1A1A24] hover:bg-[#22222F] text-slate-200 border border-[#2A2A3A]'
                  }`}
                >
                  {plan.cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 border-t border-[#2A2A3A]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-white text-3xl font-bold mb-3">Loved by Creators</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-5 rounded-2xl bg-[#111118] border border-[#2A2A3A]"
              >
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <Star key={s} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">"{t.quote}"</p>
                <div>
                  <p className="text-white text-sm font-semibold">{t.name}</p>
                  <p className="text-slate-500 text-xs">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 border-t border-[#2A2A3A]">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mx-auto mb-6">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-white text-3xl font-bold mb-4">Ready to automate your lead pipeline?</h2>
          <p className="text-slate-400 text-sm mb-8">Start with the AI agent. See your first lead in minutes.</p>
          <Link
            to="/chat"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-xl shadow-indigo-500/20"
          >
            <Sparkles className="w-4 h-4" /> Launch the Agent <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2A2A3A] px-6 py-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="text-slate-400 text-xs">Inflx by AutoStream © 2025</span>
          </div>
          <div className="flex gap-6">
            {[
              { href: '/docs', label: 'Docs' },
              { href: '/chat', label: 'AI Agent' },
              { href: '/dashboard', label: 'Dashboard' },
            ].map(l => (
              <Link key={l.href} to={l.href} className="text-slate-600 hover:text-slate-300 text-xs transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
