import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message, IntentType } from '../types';

interface ChatState {
  sessionId: string | null;
  messages: Message[];
  intent: IntentType;
  intentHistory: string[];
  leadName: string | null;
  leadEmail: string | null;
  leadPlatform: string | null;
  leadCaptured: boolean;
  turnCount: number;
  isLoading: boolean;
  isConnected: boolean;

  setSessionId: (id: string) => void;
  addMessage: (msg: Message) => void;
  updateAgentState: (data: Partial<ChatState>) => void;
  setLoading: (v: boolean) => void;
  setConnected: (v: boolean) => void;
  resetChat: () => void;
}

const initialState = {
  sessionId: null,
  messages: [],
  intent: 'greeting' as IntentType,
  intentHistory: [],
  leadName: null,
  leadEmail: null,
  leadPlatform: null,
  leadCaptured: false,
  turnCount: 0,
  isLoading: false,
  isConnected: false,
};

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      ...initialState,
      setSessionId: (id) => set({ sessionId: id }),
      addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
      updateAgentState: (data) => set((s) => ({ ...s, ...data })),
      setLoading: (v) => set({ isLoading: v }),
      setConnected: (v) => set({ isConnected: v }),
      resetChat: () => set(initialState),
    }),
    {
      name: 'inflx-chat-storage', // name of the item in the storage (must be unique)
      partialize: (state) => ({ 
        sessionId: state.sessionId,
        messages: state.messages,
        intent: state.intent,
        intentHistory: state.intentHistory,
        leadName: state.leadName,
        leadEmail: state.leadEmail,
        leadPlatform: state.leadPlatform,
        leadCaptured: state.leadCaptured,
        turnCount: state.turnCount
        // Notice we don't persist isLoading and isConnected
      }),
    }
  )
);
