import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronRight, BookOpen, Zap, Shield, CreditCard, HelpCircle, Terminal, Rocket } from 'lucide-react';

interface DocSection {
  id: string;
  icon: React.ElementType;
  title: string;
  color: string;
  articles: { q: string; a: string }[];
}

const DOCS: DocSection[] = [
  {
    id: 'getting-started',
    icon: Rocket,
    title: 'Getting Started',
    color: 'text-indigo-400',
    articles: [
      {
        q: 'What is AutoStream?',
        a: 'AutoStream is an AI-powered video editing SaaS platform built for content creators. It automates repetitive editing tasks — captions, cuts, transitions, color grading — so you can focus on creating, not editing.',
      },
      {
        q: 'How do I get started?',
        a: 'Simply choose a plan (Basic at $29/month or Pro at $79/month), sign up with your email, and you get instant access. Pro users get a 7-day free trial with no credit card required.',
      },
      {
        q: 'Is there a free trial?',
        a: 'Yes! AutoStream offers a 7-day free trial on the Pro plan. No credit card required. You get full access to 4K editing, AI captions, and all Pro features during the trial.',
      },
      {
        q: 'Which platforms can I import from?',
        a: 'AutoStream supports direct import from: YouTube Studio, TikTok Creator Portal, Instagram, Facebook Creator Studio, Dropbox, and Google Drive.',
      },
    ],
  },
  {
    id: 'pricing',
    icon: CreditCard,
    title: 'Pricing & Plans',
    color: 'text-emerald-400',
    articles: [
      {
        q: 'What plans are available?',
        a: 'We offer two plans:\n\n**Basic — $29/month**\n- 10 videos/month\n- 720p max resolution\n- Auto-cut & silence removal\n- Email support\n- 1 user seat · 5 GB storage\n\n**Pro — $79/month**\n- Unlimited videos\n- 4K Ultra HD\n- AI Captions (95% accuracy)\n- Brand kit, API access, Analytics\n- 24/7 live chat support\n- 5 seats · 100 GB storage',
      },
      {
        q: 'Can I upgrade from Basic to Pro?',
        a: 'Absolutely. You can upgrade from Basic to Pro at any time from your account settings. Billing is prorated — you only pay for the remaining days in your billing cycle.',
      },
      {
        q: 'Can I downgrade from Pro to Basic?',
        a: 'Yes. Downgrades take effect at the start of your next billing cycle, so you retain Pro access until then.',
      },
      {
        q: 'What is your refund policy?',
        a: 'AutoStream does not issue refunds after 7 days from the purchase date. If you cancel within the first 7 days, a full refund is processed within 3–5 business days.',
      },
    ],
  },
  {
    id: 'features',
    icon: Zap,
    title: 'Features',
    color: 'text-violet-400',
    articles: [
      {
        q: 'What is AI Captions?',
        a: 'AI Captions automatically transcribes your videos with 95% accuracy and overlays styled captions — no manual editing required. Available exclusively on the Pro plan.',
      },
      {
        q: 'What does AI scene detection do?',
        a: 'The Pro plan includes advanced AI scene detection that automatically identifies key moments, cuts unnecessary footage, and suggests optimal edit points.',
      },
      {
        q: 'What is the Brand Kit?',
        a: 'Brand Kit (Pro only) lets you upload your logos, select brand fonts and colors, and apply them consistently across all your videos with a single click.',
      },
      {
        q: 'Do I get API access?',
        a: 'Yes — Pro plan subscribers get full API access to integrate AutoStream into custom workflows, dashboards, or automation pipelines.',
      },
    ],
  },
  {
    id: 'support',
    icon: HelpCircle,
    title: 'Support',
    color: 'text-amber-400',
    articles: [
      {
        q: 'How do I reach customer support?',
        a: '**Basic Plan:** Email support with a 2-business-day response time.\n**Pro Plan:** 24/7 live chat and priority phone support.',
      },
      {
        q: 'Can the AI agent answer all my questions?',
        a: 'The Inflx AI agent is trained on the AutoStream knowledge base and can answer questions about pricing, features, policies, and help you sign up. For billing disputes or technical account issues, you\'ll be directed to the human support team.',
      },
    ],
  },
  {
    id: 'privacy',
    icon: Shield,
    title: 'Privacy & Security',
    color: 'text-cyan-400',
    articles: [
      {
        q: 'Does AutoStream sell my data?',
        a: 'No. AutoStream does not sell user data to third parties under any circumstances. We take your privacy seriously.',
      },
      {
        q: 'Is my video content secure?',
        a: 'Yes. All video content uploaded to AutoStream is encrypted at rest using AES-256 encryption. You retain 100% ownership of your content.',
      },
    ],
  },
  {
    id: 'api',
    icon: Terminal,
    title: 'API & Integrations',
    color: 'text-pink-400',
    articles: [
      {
        q: 'How do I use the AutoStream API?',
        a: 'Pro plan subscribers can access the API from the account dashboard. Use your API key in the `Authorization: Bearer <key>` header. Full API reference docs are available in the developer portal.',
      },
      {
        q: 'What integrations does AutoStream support?',
        a: 'AutoStream integrates natively with YouTube Studio, TikTok Creator Portal, Instagram, Facebook Creator Studio, Dropbox, and Google Drive. Zapier and Make (formerly Integromat) integrations are coming soon.',
      },
    ],
  },
];

function ArticleItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#2A2A3A] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 px-0 text-left group"
      >
        <span className="text-slate-200 text-sm font-medium group-hover:text-white transition-colors pr-4">
          {q}
        </span>
        <span className="flex-shrink-0 text-slate-500 group-hover:text-indigo-400 transition-colors">
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4 text-slate-400 text-sm leading-relaxed whitespace-pre-line">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DocsPage() {
  const [search, setSearch] = useState('');
  const [activeSection, setActiveSection] = useState('getting-started');

  const filtered = DOCS.map(section => ({
    ...section,
    articles: section.articles.filter(
      a =>
        !search ||
        a.q.toLowerCase().includes(search.toLowerCase()) ||
        a.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(s => !search || s.articles.length > 0);

  const activeDoc = filtered.find(d => d.id === activeSection) || filtered[0];

  return (
    <div className="min-h-screen bg-[#0A0A0F] pt-20">
      {/* Hero Header */}
      <div className="border-b border-[#2A2A3A] bg-[#111118]/60">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 text-indigo-400 text-sm font-medium mb-3">
              <BookOpen className="w-4 h-4" /> Documentation
            </div>
            <h1 className="text-white text-3xl font-bold mb-2">AutoStream Help Center</h1>
            <p className="text-slate-400 text-sm mb-6">
              Everything you need to know about AutoStream — plans, features, billing, and API.
            </p>
            {/* Search */}
            <div className="relative max-w-lg">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search documentation..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1A1A24] border border-[#2A2A3A] text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Docs Layout */}
      <div className="max-w-6xl mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar Nav */}
        <nav className="w-52 flex-shrink-0 hidden md:block">
          <p className="text-slate-600 text-xs uppercase tracking-wider font-medium mb-3">Sections</p>
          <div className="space-y-1">
            {filtered.map(section => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all text-left ${
                    isActive
                      ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-[#1A1A24]'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? section.color : ''}`} />
                  {section.title}
                  {search && (
                    <span className="ml-auto text-xs bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full">
                      {section.articles.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {search && filtered.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-4xl mb-4 block">🔍</span>
              <p className="text-slate-400">No results for "{search}"</p>
            </div>
          ) : search ? (
            // Show all sections when searching
            <div className="space-y-6">
              {filtered.map(section => {
                const Icon = section.icon;
                return (
                  <div key={section.id} className="rounded-2xl bg-[#111118] border border-[#2A2A3A] p-5">
                    <div className={`flex items-center gap-2 mb-4 ${section.color}`}>
                      <Icon className="w-4 h-4" />
                      <h2 className="font-semibold text-sm">{section.title}</h2>
                    </div>
                    {section.articles.map((a, i) => <ArticleItem key={i} {...a} />)}
                  </div>
                );
              })}
            </div>
          ) : activeDoc ? (
            <motion.div
              key={activeDoc.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <activeDoc.icon className={`w-5 h-5 ${activeDoc.color}`} />
                <h2 className="text-white text-xl font-semibold">{activeDoc.title}</h2>
              </div>
              <div className="rounded-2xl bg-[#111118] border border-[#2A2A3A] px-5 divide-y divide-[#2A2A3A]">
                {activeDoc.articles.map((article, i) => (
                  <ArticleItem key={i} {...article} />
                ))}
              </div>

              {/* CTA block */}
              <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-indigo-600/20 to-violet-600/20 border border-indigo-500/25">
                <p className="text-white font-medium mb-1">Still have questions?</p>
                <p className="text-slate-400 text-sm mb-3">
                  Our AI agent can answer questions in real time — just head to the chat.
                </p>
                <a
                  href="/chat"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors"
                >
                  <Zap className="w-4 h-4" /> Open Chat Agent
                </a>
              </div>
            </motion.div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
