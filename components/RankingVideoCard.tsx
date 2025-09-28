'use client';

import Image from 'next/image';
import Link from 'next/link';
import { sendGAEvent } from '@next/third-parties/google';
import { RankingVideo } from '@/types/videos';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Eye } from 'lucide-react';

interface RankingVideoCardProps {
  video: RankingVideo;
  rank: number;
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

// Get rank styling
const getRankStyling = (rank: number) => {
  if (rank === 1) return 'bg-yellow-500 text-white'; // Gold
  if (rank === 2) return 'bg-gray-400 text-white'; // Silver
  if (rank === 3) return 'bg-orange-600 text-white'; // Bronze
  if (rank <= 10) return 'bg-blue-500 text-white';
  return 'bg-gray-200 text-gray-700';
};

export default function RankingVideoCard({ video, rank, variant = 'list' }: RankingVideoCardProps) {
  if (variant === 'grid') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200 h-full group">
        <Link
          href={`https://www.youtube.com/watch?v=${video.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block relative aspect-video bg-gray-100 dark:bg-gray-700"
          prefetch={false}
        >
          <Image
            src={video.thumbnail_image_url}
            alt={video.title}
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-105"
            sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src.includes('i.ytimg.com')) {
                target.src = target.src.replace('maxresdefault', 'hqdefault');
              }
            }}
          />
          <div className={`absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getRankStyling(rank)}`}>
            {rank}
          </div>
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{formatNumber(video.view_count)}</span>
          </div>
        </Link>

        <div className="p-3 flex flex-col h-full">
          <Link
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
            prefetch={false}
          >
            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors leading-snug line-clamp-2">
              {video.title}
            </h3>
          </Link>

          <Link
            href={`/channel/${video.channel_id}`}
            className="mt-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium"
            prefetch={false}
            onClick={() => sendGAEvent('event', 'channel_click', {
              channelId: video.channel_id
            })}
          >
            {video.channel_title}
          </Link>

          <div className="mt-3 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <Eye className="w-4 h-4" />
            <span>{formatNumber(video.view_count)} views</span>
          </div>

          <div className="mt-2 text-[11px] text-gray-500 dark:text-gray-500">
            <div>Published {formatDate(video.published_at)}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col lg:flex-row">
        {/* Video Thumbnail */}
        <div className="lg:w-72 w-full flex-shrink-0">
          <Link
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden"
            prefetch={false}
          >
            <Image
              src={video.thumbnail_image_url}
              alt={video.title}
              fill
              className="object-cover hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 1024px) 100vw, 256px"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src.includes('i.ytimg.com')) {
                  target.src = target.src.replace('maxresdefault', 'hqdefault');
                }
              }}
            />
            {/* Rank overlay */}
            <div className={`absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getRankStyling(rank)}`}>
              {rank}
            </div>
            {/* View count overlay */}
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
              {formatNumber(video.view_count)} views
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
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2 line-clamp-2">
                {video.title}
              </h3>
            </Link>

            {/* Channel info */}
            <Link
              href={`/channel/${video.channel_id}`}
              className="flex items-center gap-2 mb-3 group"
              prefetch={false}
              onClick={() => sendGAEvent('event', 'channel_click', {
                channelId: video.channel_id
              })}
            >
              <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 font-medium">
                {video.channel_title}
              </span>
            </Link>
          </div>

          {/* Stats */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{formatNumber(video.view_count)}</span>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-500">
              Published {formatDate(video.published_at)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
