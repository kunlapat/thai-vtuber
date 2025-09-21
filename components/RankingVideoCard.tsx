'use client';

import Image from 'next/image';
import Link from 'next/link';
import { RankingVideo } from '@/types/videos';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Eye, MessageCircle, ThumbsUp, Star } from 'lucide-react';

interface RankingVideoCardProps {
  video: RankingVideo;
  rank: number;
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

// Get rank styling
const getRankStyling = (rank: number) => {
  if (rank === 1) return 'bg-yellow-500 text-white'; // Gold
  if (rank === 2) return 'bg-gray-400 text-white'; // Silver
  if (rank === 3) return 'bg-orange-600 text-white'; // Bronze
  if (rank <= 10) return 'bg-blue-500 text-white';
  return 'bg-gray-200 text-gray-700';
};

export default function RankingVideoCard({ video, rank }: RankingVideoCardProps) {
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
            >
              <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                {video.title}
              </h3>
            </Link>

            {/* Channel info */}
            <Link
              href={`/channel/${video.channel_id}`}
              className="flex items-center gap-2 mb-3 group"
            >
              <span className="text-sm text-gray-600 group-hover:text-gray-900 font-medium">
                {video.channel_title}
              </span>
              {video.is_rebranded && (
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                  Rebranded
                </span>
              )}
            </Link>
          </div>

          {/* Stats */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{formatNumber(video.view_count)}</span>
              </div>
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-4 h-4" />
                <span>{formatNumber(video.like_count)}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>{formatNumber(video.comment_count)}</span>
              </div>
              {video.favorite_count > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  <span>{formatNumber(video.favorite_count)}</span>
                </div>
              )}
            </div>
            
            <div className="text-xs text-gray-500">
              Published {formatDate(video.published_at)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
