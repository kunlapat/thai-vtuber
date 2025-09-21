import { VTuberChannel, DashboardStats } from '@/types/vtuber';

export const calculateDashboardStats = (channels: VTuberChannel[]): DashboardStats => {
  const totalChannels = channels.length;
  const totalSubscribers = channels.reduce((sum, channel) => sum + channel.subscribers, 0);
  const totalViews = channels.reduce((sum, channel) => sum + channel.views, 0);
  const averageSubscribers = totalChannels > 0 ? Math.round(totalSubscribers / totalChannels) : 0;
  const rebrandedChannels = channels.filter(channel => channel.is_rebranded).length;
  const activeChannels = channels.filter(channel => isChannelActive(channel)).length;

  return {
    totalChannels,
    totalSubscribers,
    totalViews,
    averageSubscribers,
    rebrandedChannels,
    activeChannels,
  };
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const isChannelActive = (channel: VTuberChannel): boolean => {
  if (!channel.last_published_video_at) return false;
  
  const lastVideoDate = new Date(channel.last_published_video_at);
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  
  return lastVideoDate > ninetyDaysAgo;
};

export const getPaginatedItems = <T>(items: T[], page: number, pageSize: number): T[] => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return items.slice(startIndex, endIndex);
};

export const getTotalPages = (totalItems: number, pageSize: number): number => {
  return Math.ceil(totalItems / pageSize);
};

