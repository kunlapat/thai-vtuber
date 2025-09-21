'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChannelDetail } from '@/types/vtuber';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface ChannelHeaderProps {
  channel: ChannelDetail;
}

// Format numbers for display
const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

// Format date to relative time
const formatDate = (dateString: string) => {
  try {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: enUS,
    });
  } catch {
    return 'Unknown';
  }
};

export default function ChannelHeader({ channel }: ChannelHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {/* Channel Avatar */}
          <div className="flex-shrink-0">
            <Image
              src={channel.thumbnail_icon_url}
              alt={channel.title}
              width={128}
              height={128}
              className="w-24 h-24 md:w-24 md:h-24 rounded-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src.includes('yt3.ggpht.com')) {
                  target.src = target.src.replace('yt3.ggpht.com', 'yt3.googleusercontent.com');
                }
              }}
            />
          </div>
          
          {/* Channel Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                  {channel.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-1 mb-3 text-sm text-gray-600">
                  <span>{formatNumber(channel.subscribers)} subscribers</span>
                  <span className="mx-1">•</span>
                  <span>{formatNumber(channel.videos)} videos</span>
                </div>
                
                {channel.description && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                      {channel.description}
                    </p>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    channel.is_rebranded 
                      ? 'bg-orange-100 text-orange-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {channel.is_rebranded ? 'Rebranded Channel' : 'Original Channel'}
                  </span>
                  
                  {channel.last_published_video_at && (
                    <span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      Latest video {formatDate(channel.last_published_video_at)}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 flex-shrink-0">
                <Link
                  href={`https://www.youtube.com/channel/${channel.channel_id}?sub_confirmation=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  prefetch={false}
                  className="bg-gray-900 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors inline-block"
                >
                  Subscribe
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}