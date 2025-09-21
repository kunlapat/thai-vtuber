'use client';

import { useState } from 'react';
import { VideoTabType } from '@/types/videos';
import VideosTabs from '@/components/VideosTabs';
import VideosList from '@/components/VideosList';

export default function VideosPage() {
  const [activeTab, setActiveTab] = useState<VideoTabType>('upcoming');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 mb-6">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Thai VTuber Videos</h1>
              <p className="text-gray-600 mt-2">
                Discover upcoming streams, live content, and trending videos from Thai VTubers
              </p>
            </div>
          </div>
        </div>
        
        {/* Tabs Navigation */}
        <VideosTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-12">
        <VideosList activeTab={activeTab} />
      </div>
    </div>
  );
}
