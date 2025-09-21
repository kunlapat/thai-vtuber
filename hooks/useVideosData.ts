'use client';

import { useQuery } from '@tanstack/react-query';
import { 
  VideoApiResponse, 
  UpcomingVideo, 
  LiveVideo, 
  RankingVideo, 
  VideoApiEndpoint,
  VideoTabType 
} from '@/types/videos';

// Generic hook for fetching video data
const useVideoData = <T>(endpoint: VideoApiEndpoint, tabType: VideoTabType) => {
  return useQuery<VideoApiResponse<T>>({
    queryKey: ['videos', tabType],
    queryFn: async () => {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${tabType} videos`);
      }
      return response.json();
    },
    refetchInterval: getRefreshInterval(tabType),
    staleTime: getStaleTime(tabType),
  });
};

// Get refresh interval based on tab type
const getRefreshInterval = (tabType: VideoTabType): number => {
  switch (tabType) {
    case 'live':
      return 30000; // 30 seconds for live videos
    case 'upcoming':
      return 300000; // 5 minutes for upcoming videos
    default:
      return 600000; // 10 minutes for rankings
  }
};

// Get stale time based on tab type
const getStaleTime = (tabType: VideoTabType): number => {
  switch (tabType) {
    case 'live':
      return 15000; // 15 seconds for live videos
    case 'upcoming':
      return 120000; // 2 minutes for upcoming videos
    default:
      return 300000; // 5 minutes for rankings
  }
};

// Specific hooks for each video type
export const useUpcomingVideos = () => {
  return useVideoData<UpcomingVideo>(VideoApiEndpoint.UPCOMING, 'upcoming');
};

export const useLiveVideos = () => {
  return useVideoData<LiveVideo>(VideoApiEndpoint.LIVE, 'live');
};

export const use24HrRankingVideos = () => {
  return useVideoData<RankingVideo>(VideoApiEndpoint.RANKING_24HR, '24hr');
};

export const use3DaysRankingVideos = () => {
  return useVideoData<RankingVideo>(VideoApiEndpoint.RANKING_3DAYS, '3days');
};

export const use7DaysRankingVideos = () => {
  return useVideoData<RankingVideo>(VideoApiEndpoint.RANKING_7DAYS, '7days');
};
