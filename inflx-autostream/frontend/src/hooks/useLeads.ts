import { useQuery } from '@tanstack/react-query';
import { fetchLeads } from '../api/client';

export function useLeads() {
  return useQuery({
    queryKey: ['leads'],
    queryFn: fetchLeads,
    refetchInterval: 10000, // auto-refresh every 10 seconds
    staleTime: 5000,
  });
}
