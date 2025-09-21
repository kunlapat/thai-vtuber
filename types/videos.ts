// Video types for the Thai VTuber video APIs

// Base video interface
interface BaseVideo {
  id: string;
  title: string;
  channel_id: string;
  thumbnail_image_url: string;
  published_at: string;
}

// Upcoming videos
export interface UpcomingVideo extends BaseVideo {
  channel_title: string;
  channel_thumbnail_image_url: string;
  channel_is_rebranded: boolean;
  description: string;
  view_count: number;
  live_status: number;
  live_schedule: string;
  live_concurrent_viewer_count: number;
}

// Live videos
export interface LiveVideo extends BaseVideo {
  channel_title: string;
  channel_thumbnail_image_url: string;
  channel_is_rebranded: boolean;
  description: string;
  view_count: number;
  live_status: number;
  live_schedule: string;
  live_start?: string;
  live_end?: string;
  live_concurrent_viewer_count: number;
}

// Ranking videos (24hr, 3 days, 7 days)
export interface RankingVideo extends BaseVideo {
  channel_title: string;
  is_rebranded: boolean;
  view_count: number;
  comment_count: number;
  dislike_count: number;
  favorite_count: number;
  like_count: number;
}

// API response wrapper
export interface VideoApiResponse<T> {
  result: T[];
}

// Tab types for the videos page
export type VideoTabType = 'upcoming' | 'live' | '24hr' | '3days' | '7days';

// Union type for all video types
export type Video = UpcomingVideo | LiveVideo | RankingVideo;

// API endpoints enum
export enum VideoApiEndpoint {
  UPCOMING = '/api/videos/upcoming',
  LIVE = '/api/videos/live',
  RANKING_24HR = '/api/videos/ranking/24hr',
  RANKING_3DAYS = '/api/videos/ranking/3days',
  RANKING_7DAYS = '/api/videos/ranking/7days'
}
