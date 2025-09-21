import { useQuery } from '@tanstack/react-query';
import { YouTubeFeedItem, YouTubePlaylistItem } from '@/types/youtube';
import { ChannelDetail, ChannelDetailApiResponse } from '@/types/vtuber';

// Hook for fetching YouTube channel videos
export const useYouTubeChannelVideos = (channelId: string, limit: number = 10) => {
  return useQuery({
    queryKey: ['youtube-videos', channelId, limit],
    queryFn: async (): Promise<YouTubeFeedItem[]> => {
      const response = await fetch(`/api/youtube?channelId=${channelId}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch YouTube videos: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    },
    enabled: !!channelId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook for fetching YouTube playlist videos
export const useYouTubePlaylist = (playlistId: string, limit: number = 10) => {
  return useQuery({
    queryKey: ['youtube-playlist', playlistId, limit],
    queryFn: async (): Promise<YouTubePlaylistItem[]> => {
      const response = await fetch(`/api/youtube/playlist?playlistId=${playlistId}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch YouTube playlist: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    },
    enabled: !!playlistId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook for fetching channel details from the detail API endpoint
export const useChannelDetails = (channelId: string) => {
  return useQuery<ChannelDetail | null>({
    queryKey: ['channel-details', channelId],
    queryFn: async (): Promise<ChannelDetail | null> => {
      try {
        const response = await fetch(`https://storage.googleapis.com/thaivtuberranking.appspot.com/v2/channel_data/detail/${channelId}.json`);
        
        if (!response.ok) {
          if (response.status === 404) {
            return null; // Channel not found
          }
          throw new Error(`Failed to fetch channel details: ${response.statusText}`);
        }
        
        // Check if response is JSON (not XML error)
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          // If the detail API is not available, fall back to simple list
          console.warn('Channel detail API not available, falling back to simple list');
          const simpleResponse = await fetch('https://storage.googleapis.com/thaivtuberranking.appspot.com/v2/channel_data/simple_list.json');
          
          if (!simpleResponse.ok) {
            throw new Error(`Failed to fetch VTuber data: ${simpleResponse.statusText}`);
          }
          
          const simpleData = await simpleResponse.json();
          const channel = simpleData.result.find((ch: any) => ch.channel_id === channelId);
          
          if (channel) {
            // Convert simple channel to detail format with placeholder description
            return {
              ...channel,
              description: 'Channel description not available',
              comments: null,
              videos: 0,
              uploads: `UU${channelId.substring(2)}`,
            };
          }
          return null;
        }
        
        const data: ChannelDetailApiResponse = await response.json();
        return data.result;
      } catch (error) {
        console.error('Error fetching channel details:', error);
        throw error;
      }
    },
    enabled: !!channelId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
