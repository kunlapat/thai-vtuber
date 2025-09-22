'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { sendGAEvent } from '@next/third-parties/google';
import { LiveVideo } from '@/types/videos';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Users, Radio } from 'lucide-react';

interface LiveVideoCardProps {
  video: LiveVideo;
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

export default function LiveVideoCard({ video }: LiveVideoCardProps) {
  const [channelImageError, setChannelImageError] = useState(false);
  const isLive = video.live_status === 1;
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col lg:flex-row">
        {/* Video Thumbnail */}
        <div className="lg:w-72 w-full flex-shrink-0">
          <Link
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block relative aspect-video bg-gray-100 rounded-lg overflow-hidden"
            prefetch={false}
          >
            <Image
              src={video.thumbnail_image_url}
              alt={video.title}
              fill
              className="object-cover hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 1024px) 100vw, 288px"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src.includes('i.ytimg.com')) {
                  target.src = target.src.replace('maxresdefault', 'hqdefault');
                }
              }}
            />
            {/* Live badge */}
            <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${
              isLive 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-600 text-white'
            }`}>
              {isLive ? (
                <>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  LIVE
                </>
              ) : (
                <>
                  <Radio className="w-3 h-3" />
                  Ended
                </>
              )}
            </div>
            
            {/* Viewer count overlay */}
            {video.live_concurrent_viewer_count > 0 && (
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                {formatNumber(video.live_concurrent_viewer_count)} watching
              </div>
            )}
          </Link>
        </div>

        {/* Video Info */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <Link
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
              prefetch={false}
            >
              <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                {video.title}
              </h3>
            </Link>

            {/* Channel info */}
            <Link
              href={`/channel/${video.channel_id}`}
              className="flex items-center gap-3 mb-3 group"
              prefetch={false}
              onClick={() => sendGAEvent('event', 'channel_click', {
                channelId: video.channel_id
              })}
            >
              {!channelImageError && (
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  <Image
                    src={video.channel_thumbnail_image_url}
                    alt={video.channel_title}
                    fill
                    className="object-cover"
                    onError={() => setChannelImageError(true)}
                  />
                </div>
              )}
              <span className="text-sm text-gray-600 group-hover:text-gray-900 font-medium">
                {video.channel_title}
              </span>
            </Link>

          </div>

          {/* Stats */}
          <div className="space-y-2">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {video.live_concurrent_viewer_count > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{formatNumber(video.live_concurrent_viewer_count)} {isLive ? 'watching' : 'watched'}</span>
                </div>
              )}
              {video.live_start && (
                <div>
                  Started {formatDate(video.live_start)}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{formatNumber(video.view_count)} views</span>
              <span>•</span>
              <span>Scheduled {formatDate(video.live_schedule)}</span>
              {video.live_end && (
                <>
                  <span>•</span>
                  <span>Ended {formatDate(video.live_end)}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
