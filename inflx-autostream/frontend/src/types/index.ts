export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatResponse {
  session_id: string;
  response: string;
  intent: 'greeting' | 'inquiry' | 'high_intent';
  intent_history: string[];
  lead_name: string | null;
  lead_email: string | null;
  lead_platform: string | null;
  lead_captured: boolean;
  turn_count: number;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  platform: string;
  captured_at: string;
  session_id: string;
  turn_count: number;
}

export interface LeadsResponse {
  leads: Lead[];
  total: number;
  total_today: number;
  platforms: Record<string, number>;
}

export type IntentType = 'greeting' | 'inquiry' | 'high_intent';
