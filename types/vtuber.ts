export interface VTuberChannel {
  channel_id: string;
  title: string;
  thumbnail_icon_url: string;
  subscribers: number;
  views: number;
  published_at: string;
  last_published_video_at: string;
  updated_at: number;
  is_rebranded: boolean;
}

export interface VTuberApiResponse {
  result: VTuberChannel[];
}

export interface DashboardFilters {
  search: string;
  showOriginalVtuber: boolean;
  showInactive: boolean;
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

export interface DashboardStats {
  totalChannels: number;
  totalSubscribers: number;
  totalViews: number;
  averageSubscribers: number;
  rebrandedChannels: number;
  activeChannels: number;
}

// Chart tooltip types
export interface TooltipPayloadEntry {
  dataKey: string;
  value: number;
  color: string;
  payload: {
    fullName?: string;
    name?: string;
    subscribers?: number;
    views?: number;
    ratio?: number;
  };
}

export interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string | number;
}

