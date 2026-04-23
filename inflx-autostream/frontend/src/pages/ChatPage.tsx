import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, RotateCcw, PanelRight } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { createSession, sendMessage, checkHealth } from '../api/client';
import MessageBubble from '../components/chat/MessageBubble';
import TypingIndicator from '../components/chat/TypingIndicator';
import StateInspector from '../components/chat/StateInspector';
import Toast from '../components/ui/Toast';
const SUGGESTIONS = [
  "What plans do you offer?",
  "Tell me about the Pro plan",
  "How much does Basic cost?",
  "What's your refund policy?",
  "I want to sign up for Pro!"
];

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [showInspector, setShowInspector] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '' });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const store = useChatStore();

  // Init session
  useEffect(() => {
    const init = async () => {
      const healthy = await checkHealth();
      store.setConnected(healthy);
      if (!store.sessionId) {
        const { session_id } = await createSession();
        store.setSessionId(session_id);
      }
    };
    init();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [store.messages, store.isLoading]);

  const handleSend = useCallback(async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || !store.sessionId || store.isLoading) return;
    setInput('');

    const userMessage = { role: 'user' as const, content: msg, timestamp: new Date().toISOString() };
    store.addMessage(userMessage);
    store.setLoading(true);

    try {
      const res = await sendMessage(store.sessionId, msg);
      store.addMessage({ role: 'assistant', content: res.response, timestamp: new Date().toISOString() });
      store.updateAgentState({
        intent: res.intent,
        intentHistory: res.intent_history,
        leadName: res.lead_name,
        leadEmail: res.lead_email,
        leadPlatform: res.lead_platform,
        leadCaptured: res.lead_captured,
        turnCount: res.turn_count,
      });
      if (res.lead_captured && !store.leadCaptured) {
        setToast({
          show: true,
          message: `🎉 Lead captured! Welcome, ${res.lead_name}!`,
        });
      }
    } catch (err) {
      store.addMessage({ role: 'assistant', content: '⚠️ Connection error. Please check the backend is running.', timestamp: new Date().toISOString() });
    } finally {
      store.setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, store]);

  const handleReset = async () => {
    store.resetChat();
    const { session_id } = await createSession();
    store.setSessionId(session_id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex h-screen pt-16 bg-[#0A0A0F]">
      {/* Chat Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/50">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${store.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-white font-semibold">AutoStream AI Agent</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30">
              Gemini 1.5 Flash
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-2 text-xs transition-all">
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <button onClick={() => setShowInspector(!showInspector)}
              className={`p-2 rounded-lg transition-all ${showInspector ? 'bg-brand-500/20 text-brand-400' : 'text-slate-400 hover:bg-surface-2 hover:text-white'}`}>
              <PanelRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4">
          {store.messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-6 px-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center mx-auto mb-4 glow-brand">
                  <span className="text-2xl">🎬</span>
                </div>
                <h2 className="text-white font-bold text-xl mb-2">AutoStream AI Assistant</h2>
                <p className="text-slate-400 text-sm max-w-sm">Ask me about plans, features, pricing, or just say hi. I'll guide you to the perfect plan.</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => handleSend(s)}
                    className="px-3 py-2 rounded-xl border border-border bg-surface text-slate-300 text-sm hover:border-brand-500/40 hover:text-white hover:bg-surface-2 transition-all">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {store.messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} isNew={i === store.messages.length - 1} />
          ))}

          {store.isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-4 border-t border-border bg-surface/30">
          <div className="flex items-end gap-3 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown} rows={1} placeholder="Ask about pricing, features, or say hi..."
                className="w-full px-4 py-3 pr-12 rounded-xl bg-surface border border-border text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500/50 resize-none transition-all"
                style={{ minHeight: '44px', maxHeight: '120px' }} />
            </div>
            <button onClick={() => handleSend()} disabled={!input.trim() || store.isLoading}
              className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-brand text-white flex items-center justify-center hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all glow-brand">
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-600 text-center mt-2">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>

      {/* State Inspector Panel */}
      <AnimatePresence>
        {showInspector && (
          <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.25 }}
            className="border-l border-border bg-surface overflow-hidden flex-shrink-0">
            <StateInspector />
          </motion.div>
        )}
      </AnimatePresence>
      <Toast
        show={toast.show}
        message={toast.message}
        onClose={() => setToast({ show: false, message: '' })}
        type="success"
      />
    </div>
  );
}
