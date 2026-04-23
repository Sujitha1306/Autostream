import { motion } from 'framer-motion';

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold text-brand-400">AI</span>
      </div>
      <div className="flex items-center gap-1 px-4 py-3 rounded-2xl rounded-tl-sm bg-surface border border-border">
        {[0, 1, 2].map((i) => (
          <motion.div key={i} className="w-2 h-2 rounded-full bg-brand-400"
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
        ))}
      </div>
    </div>
  );
}
