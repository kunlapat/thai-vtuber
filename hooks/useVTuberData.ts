import { useQuery } from '@tanstack/react-query';
import { VTuberApiResponse } from '@/types/vtuber';

const API_URL = 'https://storage.googleapis.com/thaivtuberranking.appspot.com/v2/channel_data/simple_list.json';

const fetchVTuberData = async (): Promise<VTuberApiResponse> => {
  const response = await fetch(API_URL);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch VTuber data: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data;
};

export const useVTuberData = () => {
  return useQuery({
    queryKey: ['vtuber-data'],
    queryFn: fetchVTuberData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (garbage collection time)
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

