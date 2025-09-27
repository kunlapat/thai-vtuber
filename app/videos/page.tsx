'use client';

import { useState } from 'react';
import { VideoTabType } from '@/types/videos';
import VideosTabs from '@/components/VideosTabs';
import VideosList from '@/components/VideosList';
import { LayoutGrid, List } from 'lucide-react';

export default function VideosPage() {
  const [activeTab, setActiveTab] = useState<VideoTabType>('live-upcoming');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Thai VTuber Videos</h1>
        <p className="mt-2 text-gray-600">
          Discover upcoming streams, live content, and trending videos from Thai VTubers
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <VideosTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="self-start md:self-auto bg-white rounded-lg shadow-sm border border-gray-200 p-1">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <List className="w-4 h-4" />
              List
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <VideosList activeTab={activeTab} viewMode={viewMode} />
    </div>
  );
}
