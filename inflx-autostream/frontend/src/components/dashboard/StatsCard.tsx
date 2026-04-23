import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: 'indigo' | 'emerald' | 'violet' | 'amber';
  trend?: { value: number; label: string };
}

const colorMap = {
  indigo: {
    bg: 'bg-indigo-500/10',
    icon: 'text-indigo-400',
    border: 'border-indigo-500/20',
    glow: '0 0 20px rgba(99,102,241,0.15)',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    icon: 'text-emerald-400',
    border: 'border-emerald-500/20',
    glow: '0 0 20px rgba(16,185,129,0.15)',
  },
  violet: {
    bg: 'bg-violet-500/10',
    icon: 'text-violet-400',
    border: 'border-violet-500/20',
    glow: '0 0 20px rgba(167,139,250,0.15)',
  },
  amber: {
    bg: 'bg-amber-500/10',
    icon: 'text-amber-400',
    border: 'border-amber-500/20',
    glow: '0 0 20px rgba(245,158,11,0.15)',
  },
};

export default function StatsCard({ title, value, subtitle, icon: Icon, color, trend }: StatsCardProps) {
  const c = colorMap[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative p-5 rounded-2xl bg-[#111118] border ${c.border} overflow-hidden`}
      style={{ boxShadow: c.glow }}
    >
      {/* Background decoration */}
      <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full ${c.bg} blur-xl`} />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">{title}</p>
          <p className="text-white text-3xl font-bold">{value}</p>
          {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-xs font-medium ${trend.value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-slate-600 text-xs">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${c.bg}`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
      </div>
    </motion.div>
  );
}
