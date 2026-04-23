import axios from 'axios';
import type { ChatResponse, LeadsResponse } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

export const createSession = async (): Promise<{ session_id: string }> => {
  const { data } = await api.post('/api/session/new');
  return data;
};

export const sendMessage = async (session_id: string, message: string): Promise<ChatResponse> => {
  const { data } = await api.post('/api/chat', { session_id, message });
  return data;
};

export const fetchLeads = async (): Promise<LeadsResponse> => {
  const { data } = await api.get('/api/leads');
  return data;
};

export const checkHealth = async (): Promise<boolean> => {
  try {
    await api.get('/health');
    return true;
  } catch {
    return false;
  }
};
