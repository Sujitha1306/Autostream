import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  show: boolean;
  message: string;
  onClose: () => void;
  type?: 'success' | 'error' | 'info';
}

export default function Toast({ show, message, onClose, type = 'success' }: ToastProps) {
  useEffect(() => {
    if (show) {
      const t = setTimeout(onClose, 5000);
      return () => clearTimeout(t);
    }
  }, [show, onClose]);

  const styles = {
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    error: 'bg-red-500/10 border-red-500/30 text-red-400',
    info: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-md shadow-2xl max-w-sm ${styles[type]}`}
        >
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium flex-1">{message}</p>
          <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
