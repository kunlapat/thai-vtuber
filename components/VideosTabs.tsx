'use client';

import { VideoTabType } from '@/types/videos';

interface VideosTabsProps {
  activeTab: VideoTabType;
  onTabChange: (tab: VideoTabType) => void;
}

const tabs = [
  { id: 'upcoming' as const, label: 'Upcoming' },
  { id: 'live' as const, label: 'Live' },
  { id: '24hr' as const, label: '24 Hours' },
  { id: '3days' as const, label: '3 Days' },
  { id: '7days' as const, label: '7 Days' },
];

export default function VideosTabs({ activeTab, onTabChange }: VideosTabsProps) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <nav className="flex space-x-0 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-3 px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
