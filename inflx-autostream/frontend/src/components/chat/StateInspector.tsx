import { motion, AnimatePresence } from 'framer-motion';
import { Brain, User, Mail, Monitor, CheckCircle, Clock, Zap, TrendingUp } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';

const intentConfig = {
  greeting: { label: 'Greeting', color: 'text-slate-400', bg: 'bg-slate-500/20', border: 'border-slate-500/30', dot: 'bg-slate-400' },
  inquiry: { label: 'Inquiry', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30', dot: 'bg-amber-400' },
  high_intent: { label: 'High Intent 🔥', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
};

export default function StateInspector() {
  const { intent, intentHistory, leadName, leadEmail, leadPlatform, leadCaptured, turnCount } = useChatStore();
  const cfg = intentConfig[intent] || intentConfig.greeting;

  const fields = [
    { label: 'Name', value: leadName, icon: User },
    { label: 'Email', value: leadEmail, icon: Mail },
    { label: 'Platform', value: leadPlatform, icon: Monitor },
  ];

  return (
    <div className="h-full flex flex-col gap-4 p-4 overflow-y-auto">
      <div className="flex items-center gap-2 text-white font-semibold text-sm">
        <Brain className="w-4 h-4 text-brand-400" />
        Agent State Inspector
      </div>

      {/* Intent Badge */}
      <div className={`p-3 rounded-xl border ${cfg.bg} ${cfg.border}`}>
        <div className="text-xs text-slate-500 mb-1 font-medium">CURRENT INTENT</div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${cfg.dot} animate-pulse`} />
          <span className={`font-semibold text-sm ${cfg.color}`}>{cfg.label}</span>
        </div>
      </div>

      {/* Turn counter */}
      <div className="p-3 rounded-xl border border-border bg-surface flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
          <Zap className="w-3.5 h-3.5" />
          TURN COUNT
        </div>
        <span className="text-white font-bold">{turnCount}</span>
      </div>

      {/* Lead Fields */}
      <div className="p-3 rounded-xl border border-border bg-surface">
        <div className="text-xs text-slate-500 mb-3 font-medium">LEAD COLLECTION</div>
        <div className="space-y-2.5">
          {fields.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-slate-400">
                <Icon className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">{label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {value
                  ? <><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /><span className="text-xs text-emerald-400 font-medium max-w-[90px] truncate">{value}</span></>
                  : <><Clock className="w-3.5 h-3.5 text-slate-600" /><span className="text-xs text-slate-600">Pending</span></>
                }
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Capture Status */}
      <AnimatePresence>
        {leadCaptured && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 glow-success">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <CheckCircle className="w-4 h-4" />
              Lead Captured! ✅
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Intent History */}
      {intentHistory.length > 0 && (
        <div className="p-3 rounded-xl border border-border bg-surface">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            INTENT TRAIL
          </div>
          <div className="flex flex-wrap gap-1">
            {intentHistory.map((h, i) => (
              <span key={i} className={`text-xs px-2 py-0.5 rounded-full border ${intentConfig[h as keyof typeof intentConfig]?.bg || ''} ${intentConfig[h as keyof typeof intentConfig]?.border || ''} ${intentConfig[h as keyof typeof intentConfig]?.color || ''}`}>
                {h}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
