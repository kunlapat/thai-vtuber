'use client';

import { Users, Eye, TrendingUp, Activity, Loader, AlertCircle, RefreshCw } from 'lucide-react';
import { useVTuberData } from '@/hooks/useVTuberData';
import { calculateDashboardStats, formatNumber } from '@/utils/vtuberStats';
import { StatCard } from '@/components/StatCard';
import { VTuberCharts } from '@/components/VTuberCharts';
import { useMemo } from 'react';

export default function Analytics() {
  const { data, isLoading, error, refetch } = useVTuberData();

  const stats = useMemo(() => {
    return data?.result ? calculateDashboardStats(data.result) : null;
  }, [data?.result]);

  const handleRetry = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load analytics</h2>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Comprehensive data visualization and insights for Thai VTuber channels
        </p>
      </div>

      {/* Key Metrics */}
      {stats && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Channels"
              value={stats.totalChannels}
              icon={<Users className="w-5 h-5" />}
              description="Active VTuber channels"
            />
            <StatCard
              title="Total Subscribers"
              value={formatNumber(stats.totalSubscribers)}
              icon={<Users className="w-5 h-5" />}
              description="Across all channels"
            />
            <StatCard
              title="Total Views"
              value={formatNumber(stats.totalViews)}
              icon={<Eye className="w-5 h-5" />}
              description="All-time video views"
            />
            <StatCard
              title="Avg Subscribers"
              value={formatNumber(stats.averageSubscribers)}
              icon={<TrendingUp className="w-5 h-5" />}
              description="Per channel"
            />
          </div>
        </div>
      )}

      {/* Data Visualization */}
      {data?.result && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Data Visualization</h2>
          <VTuberCharts channels={data.result} />
        </div>
      )}
    </div>
  );
}
