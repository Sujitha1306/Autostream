import { motion } from 'framer-motion';
import { format } from 'date-fns';
import type { Lead } from '../../types';

interface LeadsTableProps {
  leads: Lead[];
}

const PLATFORM_COLORS: Record<string, string> = {
  YouTube: 'bg-red-500/20 text-red-400 border-red-500/30',
  Instagram: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  TikTok: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  'Twitter/X': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Facebook: 'bg-blue-600/20 text-blue-300 border-blue-600/30',
  Twitch: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Other: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

export default function LeadsTable({ leads }: LeadsTableProps) {
  if (leads.length === 0) {
    return (
      <div className="rounded-2xl bg-[#111118] border border-[#2A2A3A] p-12 text-center">
        <span className="text-5xl mb-4 block">🎯</span>
        <p className="text-white font-medium mb-1">No leads captured yet</p>
        <p className="text-slate-500 text-sm">Go to the chat page and have a conversation to capture your first lead.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[#111118] border border-[#2A2A3A] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#2A2A3A] flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold">All Captured Leads</h3>
          <p className="text-slate-500 text-xs mt-0.5">{leads.length} total leads</p>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          Live
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1A1A24]">
              {['#', 'Name', 'Email', 'Platform', 'Turns', 'Captured At', 'Session'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...leads].reverse().map((lead, i) => (
              <motion.tr
                key={lead.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="border-b border-[#1A1A24] hover:bg-[#1A1A24]/50 transition-colors"
              >
                <td className="px-5 py-3.5 text-slate-600 text-sm font-mono">{leads.length - i}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {lead.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-white text-sm font-medium">{lead.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-slate-400 text-sm font-mono">{lead.email}</td>
                <td className="px-5 py-3.5">
                  <span className={`px-2.5 py-1 rounded-full border text-xs font-medium ${PLATFORM_COLORS[lead.platform] || PLATFORM_COLORS['Other']}`}>
                    {lead.platform}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-slate-400 text-sm text-center">{lead.turn_count}</td>
                <td className="px-5 py-3.5 text-slate-400 text-sm">
                  {format(new Date(lead.captured_at), 'MMM d, h:mm a')}
                </td>
                <td className="px-5 py-3.5 text-slate-600 text-xs font-mono">
                  {lead.session_id.substring(0, 8)}…
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
