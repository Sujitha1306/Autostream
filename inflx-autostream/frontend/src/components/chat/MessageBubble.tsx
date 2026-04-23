import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { User, Zap } from 'lucide-react';
import type { Message } from '../../types';

interface Props { message: Message; isNew?: boolean; }

export default function MessageBubble({ message, isNew }: Props) {
  const isUser = message.role === 'user';
  const timeAgo = message.timestamp
    ? formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })
    : '';

  return (
    <motion.div
      initial={isNew ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 px-4 py-2 group ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>

      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 self-end mb-1 ${
        isUser ? 'bg-brand-500/20 border border-brand-500/40' : 'bg-gradient-brand'
      }`}>
        {isUser
          ? <User className="w-4 h-4 text-brand-400" />
          : <Zap className="w-4 h-4 text-white" fill="white" />
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-brand-500 text-white rounded-tr-sm'
            : 'bg-surface border border-border text-slate-200 rounded-tl-sm prose-chat'
        }`}>
          {isUser ? message.content : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          )}
        </div>
        <span className="text-xs text-slate-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {timeAgo}
        </span>
      </div>
    </motion.div>
  );
}
