'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { sendGAEvent } from '@next/third-parties/google';
import { UpcomingVideo } from '@/types/videos';
import { formatDistanceToNow, format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Calendar, Users } from 'lucide-react';

interface UpcomingVideoCardProps {
  video: UpcomingVideo;
  variant?: 'grid' | 'list';
}

// Format numbers for display
const formatNumber = (num: number | null | undefined) => {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

// Format scheduled time
const formatScheduledTime = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24 && diffInHours > 0) {
      return `in ${formatDistanceToNow(date, { locale: enUS })}`;
    } else if (diffInHours < 0) {
      return `${formatDistanceToNow(date, { addSuffix: true, locale: enUS })}`;
    } else {
      return format(date, 'MMM dd, yyyy HH:mm', { locale: enUS });
    }
  } catch {
    return 'Unknown';
  }
};

export default function UpcomingVideoCard({ video, variant = 'grid' }: UpcomingVideoCardProps) {
  const [channelImageError, setChannelImageError] = useState(false);

  if (variant === 'list') {
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
              {/* Upcoming badge */}
              <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                Upcoming
              </div>
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
                  channelId: video.channel_id,
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

            {/* Schedule and stats */}
            <div className="space-y-2">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatScheduledTime(video.live_schedule)}</span>
                </div>
                {video.live_concurrent_viewer_count > 0 && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{formatNumber(video.live_concurrent_viewer_count)} waiting</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{formatNumber(video.view_count)} views</span>
                <span>•</span>
                <span>Scheduled for {format(new Date(video.live_schedule), 'MMM dd, HH:mm')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 h-full group">
      <div className="flex flex-col h-full">
        <Link
          href={`https://www.youtube.com/watch?v=${video.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block relative aspect-video bg-gray-100"
          prefetch={false}
        >
          <Image
            src={video.thumbnail_image_url}
            alt={video.title}
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-105"
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src.includes('i.ytimg.com')) {
                target.src = target.src.replace('maxresdefault', 'hqdefault');
              }
            }}
          />
          <div className="absolute top-2 left-2 bg-blue-600 text-white px-1.5 py-0.5 rounded text-[11px] font-medium">
            Upcoming
          </div>
        </Link>

        <div className="flex-1 p-3 flex flex-col">
          <Link
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
            prefetch={false}
          >
            <h3 className="font-semibold text-sm text-gray-900 hover:text-blue-600 transition-colors leading-snug line-clamp-2">
              {video.title}
            </h3>
          </Link>

          <Link
            href={`/channel/${video.channel_id}`}
            className="flex items-center gap-2.5 mt-2 group"
            prefetch={false}
            onClick={() => sendGAEvent('event', 'channel_click', {
              channelId: video.channel_id,
            })}
          >
            {!channelImageError && (
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                <Image
                  src={video.channel_thumbnail_image_url}
                  alt={video.channel_title}
                  fill
                  className="object-cover"
                  onError={() => setChannelImageError(true)}
                />
              </div>
            )}
            <span className="text-xs text-gray-600 group-hover:text-gray-900 font-medium">
              {video.channel_title}
            </span>
          </Link>

          <div className="mt-3 space-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatScheduledTime(video.live_schedule)}</span>
            </div>
            {video.live_concurrent_viewer_count > 0 && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{formatNumber(video.live_concurrent_viewer_count)} waiting</span>
              </div>
            )}
          </div>

          <div className="mt-auto pt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-gray-500">
            <span>{formatNumber(video.view_count)} views</span>
            <span>•</span>
            <span>Scheduled for {format(new Date(video.live_schedule), 'MMM dd, HH:mm')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
