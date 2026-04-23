import { motion } from 'framer-motion';

interface PlatformChartProps {
  platforms: Record<string, number>;
  total: number;
}

const PLATFORM_COLORS: Record<string, string> = {
  YouTube: '#FF0000',
  Instagram: '#E1306C',
  TikTok: '#69C9D0',
  'Twitter/X': '#1DA1F2',
  Facebook: '#1877F2',
  Twitch: '#9146FF',
  Other: '#6366F1',
};

const PLATFORM_EMOJIS: Record<string, string> = {
  YouTube: '📺',
  Instagram: '📸',
  TikTok: '🎵',
  'Twitter/X': '🐦',
  Facebook: '👥',
  Twitch: '🎮',
  Other: '🌐',
};

export default function PlatformChart({ platforms, total }: PlatformChartProps) {
  const sorted = Object.entries(platforms).sort((a, b) => b[1] - a[1]);
  const max = sorted[0]?.[1] || 1;

  return (
    <div className="p-5 rounded-2xl bg-[#111118] border border-[#2A2A3A]">
      <h3 className="text-white font-semibold mb-1">Platform Breakdown</h3>
      <p className="text-slate-500 text-xs mb-5">Distribution of leads by creator platform</p>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-slate-600">
          <span className="text-3xl mb-2">📊</span>
          <p className="text-sm">No leads yet. Start a conversation!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(([platform, count], i) => {
            const pct = Math.round((count / total) * 100);
            const color = PLATFORM_COLORS[platform] || '#6366F1';
            const emoji = PLATFORM_EMOJIS[platform] || '🌐';
            return (
              <div key={platform}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-300 text-sm flex items-center gap-2">
                    <span>{emoji}</span> {platform}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-sm">{count}</span>
                    <span className="text-slate-500 text-xs">({pct}%)</span>
                  </div>
                </div>
                <div className="h-2 bg-[#1A1A24] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / max) * 100}%` }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className="h-full rounded-full"
                    style={{ background: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
