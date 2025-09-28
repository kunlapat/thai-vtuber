'use client';

import { ChangeEvent, KeyboardEvent, useMemo, useState, useCallback, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  AreaChart,
  Area,
  Legend,
  LabelList,
  ComposedChart,
  Line,
} from 'recharts';
import { VTuberChannel, CustomTooltipProps, TooltipPayloadEntry } from '@/types/vtuber';
import { formatNumber, isChannelActive } from '@/utils/vtuberStats';
import ScatterSearchInput from './ScatterSearchInput';

interface VTuberChartsProps {
  channels: VTuberChannel[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

// Simple debouncing hook for performance
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const TENURE_FILTERS = [
  { id: 'lt1', label: '<1y', min: 0, max: 1 },
  { id: '1to3', label: '1-3y', min: 1, max: 3 },
  { id: '3to5', label: '3-5y', min: 3, max: 5 },
  { id: '5to10', label: '5-10y', min: 5, max: 10 },
  { id: '10plus', label: '10y+', min: 10, max: Infinity },
];

const SUBSCRIBER_TIERS = [
  { id: 'micro', label: 'Micro (0-10K)', min: 0, max: 10000, color: '#8884d8' },
  { id: 'small', label: 'Small (10K-100K)', min: 10000, max: 100000, color: '#82ca9d' },
  { id: 'medium', label: 'Medium (100K-500K)', min: 100000, max: 500000, color: '#ffc658' },
  { id: 'large', label: 'Large (500K-1M)', min: 500000, max: 1000000, color: '#ff7300' },
  { id: 'mega', label: 'Mega (1M+)', min: 1000000, max: Infinity, color: '#0088FE' },
];

const GROWTH_PRESETS = [
  {
    id: 'emerging',
    label: 'Emerging (1K-10K subs)',
    minSubs: 1000,
    maxSubs: 10000,
    minEngagement: 80,
    limit: 12,
  },
  {
    id: 'scaling',
    label: 'Scaling (10K-50K subs)',
    minSubs: 10000,
    maxSubs: 50000,
    minEngagement: 65,
    limit: 12,
  },
  {
    id: 'breakout',
    label: 'Breakout (50K-150K subs)',
    minSubs: 50000,
    maxSubs: 150000,
    minEngagement: 50,
    limit: 12,
  },
];

const TOP_CHANNEL_METRICS = [
  {
    id: 'subscribers',
    label: 'Subscribers',
    dataKey: 'subscribers' as const,
    axisTickFormatter: (value: number) => formatNumber(value),
    valueFormatter: (value: number) => formatNumber(value),
    suffix: '',
  },
  {
    id: 'views',
    label: 'Total Views',
    dataKey: 'views' as const,
    axisTickFormatter: (value: number) => formatNumber(value),
    valueFormatter: (value: number) => formatNumber(value),
    suffix: '',
  },
  {
    id: 'engagementRate',
    label: 'Views / Sub',
    dataKey: 'engagementRate' as const,
    axisTickFormatter: (value: number) => `${Math.round(value)}x`,
    valueFormatter: (value: number) => `${value.toFixed(1)}x`,
    suffix: ' views/sub',
  },
] as const;

type TopChannelMetricId = typeof TOP_CHANNEL_METRICS[number]['id'];

const FRESHNESS_PRESETS = [
  {
    id: 'all',
    label: 'All channels',
    valueKey: 'total' as const,
  },
  {
    id: 'active',
    label: 'Active uploads (≤90d)',
    valueKey: 'active' as const,
  },
  {
    id: 'inactive',
    label: 'Inactive uploads (>90d)',
    valueKey: 'inactive' as const,
  },
] as const;

type FreshnessPresetId = typeof FRESHNESS_PRESETS[number]['id'];

const FRESHNESS_BUCKET_COLORS: Record<string, string> = {
  '0_7': '#059669',
  '8_30': '#10b981',
  '31_90': '#0ea5e9',
  '91_180': '#6366f1',
  '181_365': '#f97316',
  '365_plus': '#ef4444',
};

type FreshnessSegment = {
  id: string;
  label: string;
  value: number;
  share: number;
  color: string;
  active: number;
  inactive: number;
};

const CREATION_RANGE_OPTIONS = [
  {
    id: 'last5',
    label: 'Last 5 years',
    window: 5,
  },
  {
    id: 'last10',
    label: 'Last 10 years',
    window: 10,
  },
  {
    id: 'all',
    label: 'All years',
    window: null,
  },
] as const;

type CreationRangeId = typeof CREATION_RANGE_OPTIONS[number]['id'];

const normalizeText = (value: string) => value.replace(/[^a-z0-9]/gi, '').toLowerCase();

const interpolateColorChannel = (start: number, end: number, ratio: number) =>
  Math.round(start + (end - start) * ratio);

const colorFromStops = (
  ratio: number,
  stops: Array<{ value: number; color: [number, number, number] }>
) => {
  if (stops.length === 0) {
    return 'rgb(255, 255, 255)';
  }

  const first = stops[0];
  const last = stops[stops.length - 1];

  if (ratio <= first.value) {
    const [r, g, b] = first.color;
    return `rgb(${r}, ${g}, ${b})`;
  }

  if (ratio >= last.value) {
    const [r, g, b] = last.color;
    return `rgb(${r}, ${g}, ${b})`;
  }

  for (let i = 0; i < stops.length - 1; i++) {
    const current = stops[i];
    const next = stops[i + 1];
    if (ratio >= current.value && ratio <= next.value) {
      const localRatio = (ratio - current.value) / (next.value - current.value);
      const color = current.color.map((channel, index) =>
        interpolateColorChannel(channel, next.color[index], localRatio)
      ) as [number, number, number];
      return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    }
  }

  const [r, g, b] = last.color;
  return `rgb(${r}, ${g}, ${b})`;
};

const tenureColorFromRatio = (ratio: number) =>
  colorFromStops(ratio, [
    { value: 0, color: [34, 197, 94] },
    { value: 0.5, color: [250, 204, 21] },
    { value: 1, color: [249, 115, 22] },
  ]);

const scatterColorFromRatio = (ratio: number) =>
  colorFromStops(ratio, [
    { value: 0, color: [59, 130, 246] },
    { value: 0.5, color: [168, 85, 247] },
    { value: 1, color: [236, 72, 153] },
  ]);

export const VTuberCharts = ({ channels }: VTuberChartsProps) => {
  const chartData = useMemo(() => {
    // Channel leaderboard candidates with tier metadata
    const topChannelCandidates = channels
      .filter(channel => channel.subscribers > 0)
      .map(channel => {
        const tier = SUBSCRIBER_TIERS.find(
          t => channel.subscribers >= t.min && channel.subscribers < t.max
        ) ?? SUBSCRIBER_TIERS[SUBSCRIBER_TIERS.length - 1];

        const trimmedName = channel.title.length > 24
          ? `${channel.title.slice(0, 24)}...`
          : channel.title;

        const engagementRate = channel.views > 0
          ? channel.views / channel.subscribers
          : 0;

        return {
          name: trimmedName,
          fullName: channel.title,
          channelId: channel.channel_id,
          subscribers: channel.subscribers,
          views: channel.views,
          engagementRate,
          tierId: tier.id,
          tierLabel: tier.label,
          tierColor: tier.color,
        };
      });

    // Activity Status Distribution
    const activeChannels = channels.filter(c => isChannelActive(c)).length;
    const inactiveChannels = channels.length - activeChannels;
    const activityData = [
      {
        id: 'active',
        name: 'Active (≤90d)',
        value: activeChannels,
        percentage: channels.length > 0 ? Math.round((activeChannels / channels.length) * 100) : 0,
        color: '#22c55e',
      },
      {
        id: 'inactive',
        name: 'Inactive (>90d)',
        value: inactiveChannels,
        percentage: channels.length > 0 ? Math.round((inactiveChannels / channels.length) * 100) : 0,
        color: '#94a3b8',
      },
    ];

    const activitySummary = {
      total: channels.length,
      active: activeChannels,
      inactive: inactiveChannels,
      activePercentage: activityData[0]?.percentage ?? 0,
    };

    // Subscribers vs Views scatter data
    const scatterData = channels
      .filter(channel => channel.subscribers > 0 && channel.views > 0)
      .map(channel => ({
        name: channel.title,
        subscribers: channel.subscribers,
        views: channel.views,
        ratio: channel.views / channel.subscribers,
      }))
      .sort((a, b) => b.subscribers - a.subscribers);

    // Activity by year (channel creation trend)
    const yearlyActivityBuckets = new Map<number, { total: number; active: number; inactive: number }>();

    channels.forEach(channel => {
      if (!channel.published_at) {
        return;
      }

      const publishedYear = new Date(channel.published_at).getFullYear();
      if (!Number.isFinite(publishedYear)) {
        return;
      }

      const bucket = yearlyActivityBuckets.get(publishedYear) || { total: 0, active: 0, inactive: 0 };
      bucket.total += 1;
      if (isChannelActive(channel)) {
        bucket.active += 1;
      } else {
        bucket.inactive += 1;
      }
      yearlyActivityBuckets.set(publishedYear, bucket);
    });

    const sortedYearEntries = Array.from(yearlyActivityBuckets.entries()).sort((a, b) => a[0] - b[0]);

    let cumulativeTotal = 0;
    const yearlyActivity = sortedYearEntries.map(([year, stats]) => {
      cumulativeTotal += stats.total;
      const activeShare = stats.total > 0 ? parseFloat(((stats.active / stats.total) * 100).toFixed(1)) : 0;
      return {
        year,
        newChannels: stats.total,
        activeChannels: stats.active,
        inactiveChannels: stats.inactive,
        activeShare,
        cumulativeChannels: cumulativeTotal,
      };
    });

    // Engagement Rate Distribution (Views per Subscriber)
    const engagementRanges = [
      { id: '0_50', label: '0-50', min: 0, max: 50, count: 0 },
      { id: '51_100', label: '51-100', min: 51, max: 100, count: 0 },
      { id: '101_200', label: '101-200', min: 101, max: 200, count: 0 },
      { id: '201_500', label: '201-500', min: 201, max: 500, count: 0 },
      { id: '501_1000', label: '501-1000', min: 501, max: 1000, count: 0 },
      { id: '1000_plus', label: '1000+', min: 1001, max: Infinity, count: 0 },
    ];

    channels.forEach(channel => {
      if (channel.subscribers <= 0 || channel.views <= 0) {
        return;
      }

      const ratio = channel.views / channel.subscribers;
      const range = engagementRanges.find(r => ratio >= r.min && ratio <= r.max);
      if (range) {
        range.count += 1;
      }
    });

    const totalChannels = channels.length;
    const engagementData = engagementRanges.map(r => ({
      id: r.id,
      range: r.label,
      count: r.count,
      share: totalChannels > 0 ? parseFloat(((r.count / totalChannels) * 100).toFixed(1)) : 0,
    }));

    const now = new Date();
    const currentYear = now.getFullYear();

    const yearlyActivitySummary = (() => {
      if (yearlyActivity.length === 0) {
        return {
          totalChannels: channels.length,
          currentYearNew: 0,
          last5Average: 0,
          last5Total: 0,
          peakYear: null as number | null,
          peakYearNew: 0,
        };
      }

      const currentYearData = yearlyActivity.find(item => item.year === currentYear);
      const last5YearsData = yearlyActivity.filter(item => item.year >= currentYear - 4);
      const last5Total = last5YearsData.reduce((sum, item) => sum + item.newChannels, 0);
      const last5Average = last5YearsData.length > 0 ? parseFloat((last5Total / last5YearsData.length).toFixed(1)) : 0;

      const peakYearData = yearlyActivity.reduce((peak, item) => {
        if (!peak || item.newChannels > peak.newChannels) {
          return item;
        }
        return peak;
      }, null as (typeof yearlyActivity)[number] | null);

      return {
        totalChannels: channels.length,
        currentYearNew: currentYearData?.newChannels ?? 0,
        last5Average,
        last5Total,
        peakYear: peakYearData ? peakYearData.year : null,
        peakYearNew: peakYearData ? peakYearData.newChannels : 0,
      };
    })();

    const tenurePerformanceData = channels
      .filter(channel => channel.published_at && channel.subscribers > 0)
      .map(channel => {
        const publishedDate = new Date(channel.published_at);
        const publishedTime = publishedDate.getTime();
        if (Number.isNaN(publishedTime)) {
          return null;
        }

        const tenureYears = Math.max((now.getTime() - publishedTime) / (1000 * 60 * 60 * 24 * 365), 0);

        return {
          name: channel.title,
          tenureYears,
          subscribers: channel.subscribers,
          views: channel.views,
          isActive: isChannelActive(channel),
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .sort((a, b) => a.tenureYears - b.tenureYears);

    // Channel Size Categories
    const sizeCategories = SUBSCRIBER_TIERS.map(tier => ({
      id: tier.id,
      name: tier.label,
      min: tier.min,
      max: tier.max,
      color: tier.color,
      count: 0,
      active: 0,
      inactive: 0,
    }));

    channels.forEach(channel => {
      const category = sizeCategories.find(c => channel.subscribers >= c.min && channel.subscribers < c.max);
      if (category) {
        category.count++;
        if (isChannelActive(channel)) {
          category.active++;
        } else {
          category.inactive++;
        }
      }
    });

    const channelSizeSegments = sizeCategories
      .filter(c => c.count > 0)
      .map(c => ({
        id: c.id,
        label: c.name,
        count: c.count,
        percentage: channels.length > 0 ? ((c.count / channels.length) * 100) : 0,
        color: c.color,
      }));

    const channelSizeStackedData = channelSizeSegments.length
      ? [
          channelSizeSegments.reduce(
            (acc, segment) => ({
              ...acc,
              [segment.id]: channels.length > 0 ? (segment.count / channels.length) * 100 : 0,
            }),
            { group: 'Channel Share' }
          ),
        ]
      : [];

    const tierActivityData = sizeCategories
      .filter(c => c.count > 0)
      .map(c => ({
        id: c.id,
        name: c.name,
        active: c.active,
        inactive: c.inactive,
        total: c.count,
        activePercentage: c.count > 0 ? parseFloat(((c.active / c.count) * 100).toFixed(1)) : 0,
      }));

    // Growth Potential Analysis (high engagement channels scaled by subscriber tiers)
    const growthPotentialCandidates = channels
      .filter(channel => channel.subscribers > 1000 && channel.views > 0)
      .map(channel => {
        const tier = SUBSCRIBER_TIERS.find(
          t => channel.subscribers >= t.min && channel.subscribers < t.max
        ) ?? SUBSCRIBER_TIERS[SUBSCRIBER_TIERS.length - 1];

        const engagementRate = channel.subscribers > 0
          ? channel.views / channel.subscribers
          : 0;

        const trimmedName = channel.title.length > 24
          ? `${channel.title.slice(0, 24)}...`
          : channel.title;

        return {
          name: trimmedName,
          fullName: channel.title,
          subscribers: channel.subscribers,
          engagementRate,
          views: channel.views,
          tierId: tier.id,
          tierLabel: tier.label,
          tierColor: tier.color,
        };
      })
      .filter(channel => channel.engagementRate > 0);

    const freshnessBuckets = [
      { id: '0_7', label: '0-7 days', min: 0, max: 7, total: 0, active: 0, inactive: 0 },
      { id: '8_30', label: '8-30 days', min: 8, max: 30, total: 0, active: 0, inactive: 0 },
      { id: '31_90', label: '31-90 days', min: 31, max: 90, total: 0, active: 0, inactive: 0 },
      { id: '91_180', label: '91-180 days', min: 91, max: 180, total: 0, active: 0, inactive: 0 },
      { id: '181_365', label: '181-365 days', min: 181, max: 365, total: 0, active: 0, inactive: 0 },
      { id: '365_plus', label: '1+ years', min: 366, max: Infinity, total: 0, active: 0, inactive: 0 },
    ];

    channels.forEach(channel => {
      if (!channel.last_published_video_at) {
        return;
      }

      const lastVideo = new Date(channel.last_published_video_at);
      const daysSince = Math.floor((now.getTime() - lastVideo.getTime()) / (1000 * 60 * 60 * 24));
      const bucket = freshnessBuckets.find(range => daysSince >= range.min && daysSince <= range.max);

      if (!bucket) {
        return;
      }

      bucket.total += 1;

      if (isChannelActive(channel)) {
        bucket.active += 1;
      } else {
        bucket.inactive += 1;
      }
    });

    return { 
      topChannelCandidates, 
      activityData, 
      scatterData, 
      yearlyActivity,
      engagementData,
      channelSizeSegments,
      channelSizeStackedData,
      growthPotentialCandidates,
      contentFreshnessBuckets: freshnessBuckets,
      tenurePerformanceData,
      tierActivityData,
      activitySummary,
      channelSizeTotal: channels.length,
      yearlyActivitySummary,
    };
  }, [channels]);

  const [selectedScatterChannels, setSelectedScatterChannels] = useState<string[]>([]);
  const [selectedTenureFilters, setSelectedTenureFilters] = useState<string[]>(() =>
    TENURE_FILTERS.filter(filter => filter.id !== '10plus').map(filter => filter.id)
  );
  const [selectedGrowthPresetId, setSelectedGrowthPresetId] = useState<string>(GROWTH_PRESETS[0].id);
  const [topChannelMetricId, setTopChannelMetricId] = useState<TopChannelMetricId>('subscribers');
  const [selectedFreshnessPresetId, setSelectedFreshnessPresetId] = useState<FreshnessPresetId>('all');
  const [creationRangeId, setCreationRangeId] = useState<CreationRangeId>('last10');
  const [tenureActivityFilter, setTenureActivityFilter] = useState<{ active: boolean; inactive: boolean }>({
    active: true,
    inactive: false,
  });
  const toggleTenureActivity = (key: 'active' | 'inactive') =>
    setTenureActivityFilter(prev => ({ ...prev, [key]: !prev[key] }));

  const selectedGrowthPreset = useMemo(() => {
    return GROWTH_PRESETS.find(preset => preset.id === selectedGrowthPresetId) ?? GROWTH_PRESETS[0];
  }, [selectedGrowthPresetId]);

  const selectedTopChannelMetric = useMemo(() => {
    return TOP_CHANNEL_METRICS.find(metric => metric.id === topChannelMetricId) ?? TOP_CHANNEL_METRICS[0];
  }, [topChannelMetricId]);

  const selectedFreshnessPreset = useMemo(() => {
    return FRESHNESS_PRESETS.find(preset => preset.id === selectedFreshnessPresetId) ?? FRESHNESS_PRESETS[0];
  }, [selectedFreshnessPresetId]);

  const selectedCreationRange = useMemo(() => {
    return CREATION_RANGE_OPTIONS.find(option => option.id === creationRangeId) ?? CREATION_RANGE_OPTIONS[0];
  }, [creationRangeId]);

  const engagementTotals = useMemo(() => {
    const total = chartData.engagementData.reduce((sum, bucket) => sum + bucket.count, 0);
    const medianBucket = (() => {
      if (total === 0) return null;
      let cumulative = 0;
      for (const bucket of chartData.engagementData) {
        cumulative += bucket.count;
        if (cumulative >= total / 2) {
          return bucket;
        }
      }
      return chartData.engagementData[chartData.engagementData.length - 1] ?? null;
    })();

    const highEngagementCount = chartData.engagementData
      .filter(bucket => bucket.id === '501_1000' || bucket.id === '1000_plus')
      .reduce((sum, bucket) => sum + bucket.count, 0);

    const lowEngagementCount = chartData.engagementData
      .filter(bucket => bucket.id === '0_50' || bucket.id === '51_100')
      .reduce((sum, bucket) => sum + bucket.count, 0);

    return {
      total,
      medianLabel: medianBucket?.range ?? 'N/A',
      medianShare: medianBucket?.share ?? 0,
      highEngagementCount,
      highEngagementShare: total > 0 ? parseFloat(((highEngagementCount / total) * 100).toFixed(1)) : 0,
      lowEngagementCount,
      lowEngagementShare: total > 0 ? parseFloat(((lowEngagementCount / total) * 100).toFixed(1)) : 0,
    };
  }, [chartData.engagementData]);

  const overallActiveShare = useMemo(() => {
    const total = chartData.tierActivityData.reduce((sum, tier) => sum + tier.total, 0);
    const active = chartData.tierActivityData.reduce((sum, tier) => sum + tier.active, 0);
    return total > 0 ? parseFloat(((active / total) * 100).toFixed(1)) : 0;
  }, [chartData.tierActivityData]);

  const tierActivityChartData = useMemo(() => {
    return chartData.tierActivityData.map(tier => ({
      ...tier,
      benchmark: overallActiveShare,
    }));
  }, [chartData.tierActivityData, overallActiveShare]);

  const topChannelsData = useMemo(() => {
    if (!selectedTopChannelMetric) {
      return [] as Array<typeof chartData.topChannelCandidates[number] & { metricValue: number }>;
    }

    const { dataKey } = selectedTopChannelMetric;

    const sorted = [...chartData.topChannelCandidates]
      .filter(channel => Number.isFinite(channel[dataKey] as number))
      .sort((a, b) =>
        (b[dataKey] as number ?? 0) - (a[dataKey] as number ?? 0)
      )
      .slice(0, 10)
      .map(channel => ({
        ...channel,
        metricValue: (() => {
          const value = channel[dataKey] as number;
          return Number.isFinite(value) ? value : 0;
        })(),
      }));

    return sorted;
  }, [chartData.topChannelCandidates, selectedTopChannelMetric]);

  const topChannelsMaxValue = useMemo(() => {
    if (topChannelsData.length === 0) {
      return 0;
    }
    return topChannelsData.reduce((max, channel) => Math.max(max, channel.metricValue), 0);
  }, [topChannelsData]);

  const topChannelsChartHeight = useMemo(() => {
    return Math.max(320, topChannelsData.length * 36);
  }, [topChannelsData]);

  const topChannelsDomainMax = useMemo(() => {
    if (topChannelsMaxValue === 0) {
      return 10;
    }

    if (selectedTopChannelMetric?.id === 'engagementRate') {
      return Math.ceil((topChannelsMaxValue * 1.1) / 5) * 5;
    }

    return Math.ceil(topChannelsMaxValue * 1.1);
  }, [selectedTopChannelMetric, topChannelsMaxValue]);

  const topChannelsSubtitle = useMemo(() => {
    if (!selectedTopChannelMetric) {
      return 'Top channels';
    }

    switch (selectedTopChannelMetric.id) {
      case 'subscribers':
        return 'Ranked by total subscribers';
      case 'views':
        return 'Ranked by lifetime views';
      case 'engagementRate':
        return 'Highest views per subscriber ratios';
      default:
        return 'Top channels';
    }
  }, [selectedTopChannelMetric]);

  const topTierLegend = useMemo(() => {
    const unique = new Map<string, { id: string; label: string; color: string }>();
    topChannelsData.forEach(channel => {
      if (!unique.has(channel.tierId)) {
        unique.set(channel.tierId, {
          id: channel.tierId,
          label: channel.tierLabel,
          color: channel.tierColor,
        });
      }
    });
    return Array.from(unique.values());
  }, [topChannelsData]);

  const freshnessDerived = useMemo(() => {
    if (!selectedFreshnessPreset) {
      return {
        data: [] as Array<{ range: string; count: number; percentage: number }>,
        total: 0,
        maxCount: 0,
        summary: {
          last7: 0,
          last30: 0,
          ninetyPlus: 0,
          last7Percent: 0,
          last30Percent: 0,
          ninetyPlusPercent: 0,
        },
      };
    }

    const { valueKey } = selectedFreshnessPreset;
    const buckets = chartData.contentFreshnessBuckets;
    const total = buckets.reduce((sum, bucket) => sum + bucket[valueKey], 0);

    if (total === 0) {
      return {
        data: [],
        total: 0,
        maxCount: 0,
        summary: {
          last7: 0,
          last30: 0,
          ninetyPlus: 0,
          last7Percent: 0,
          last30Percent: 0,
          ninetyPlusPercent: 0,
        },
      };
    }

    const data = buckets.map(bucket => {
      const count = bucket[valueKey];
      const percentage = total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0;
      return {
        range: bucket.label,
        count,
        percentage,
      };
    });

    const maxCount = data.reduce((max, item) => Math.max(max, item.count), 0);
    const last7 = buckets[0]?.[valueKey] ?? 0;
    const last30 = (buckets[0]?.[valueKey] ?? 0) + (buckets[1]?.[valueKey] ?? 0);
    const ninetyPlus = buckets.slice(3).reduce((sum, bucket) => sum + bucket[valueKey], 0);

    const summary = {
      last7,
      last30,
      ninetyPlus,
      last7Percent: parseFloat(((last7 / total) * 100).toFixed(1)),
      last30Percent: parseFloat(((last30 / total) * 100).toFixed(1)),
      ninetyPlusPercent: parseFloat(((ninetyPlus / total) * 100).toFixed(1)),
    };

    return {
      data,
      total,
      maxCount,
      summary,
    };
  }, [chartData.contentFreshnessBuckets, selectedFreshnessPreset]);

  const freshnessChartData = freshnessDerived.data;
  const freshnessChartMaxCount = freshnessDerived.maxCount;
  const freshnessSummary = freshnessDerived.summary;
  const creationSummary = chartData.yearlyActivitySummary;

  const activityFreshness = useMemo(() => {
    const buckets = chartData.contentFreshnessBuckets;
    const total = buckets.reduce((sum, bucket) => sum + bucket.total, 0);

    if (total === 0) {
      return {
        segments: [] as FreshnessSegment[],
        total: 0,
        dominant: null as FreshnessSegment | null,
      };
    }

    const segments = buckets
      .filter(bucket => bucket.total > 0)
      .map<FreshnessSegment>(bucket => ({
        id: bucket.id,
        label: bucket.label,
        value: bucket.total,
        share: parseFloat(((bucket.total / total) * 100).toFixed(1)),
        color: FRESHNESS_BUCKET_COLORS[bucket.id] ?? '#94a3b8',
        active: bucket.active,
        inactive: bucket.inactive,
      }));

    const dominant = segments.reduce<FreshnessSegment | null>((top, segment) => {
      if (!top || segment.value > top.value) {
        return segment;
      }
      return top;
    }, null);

    return {
      segments,
      total,
      dominant,
    };
  }, [chartData.contentFreshnessBuckets]);

  const activityTrend = useMemo(() => {
    if (chartData.activitySummary.total === 0) {
      return null;
    }

    const currentYear = new Date().getFullYear();
    const previousYearEntry = [...chartData.yearlyActivity]
      .reverse()
      .find(entry => entry.year < currentYear && Number.isFinite(entry.activeShare));

    if (!previousYearEntry || typeof previousYearEntry.activeShare !== 'number') {
      return null;
    }

    const diff = parseFloat(
      (chartData.activitySummary.activePercentage - previousYearEntry.activeShare).toFixed(1)
    );

    return {
      diff,
      baselineYear: previousYearEntry.year,
      baselineShare: previousYearEntry.activeShare,
    };
  }, [chartData.activitySummary.activePercentage, chartData.activitySummary.total, chartData.yearlyActivity]);

  const filteredCreationData = useMemo(() => {
    const data = chartData.yearlyActivity;
    if (data.length === 0) {
      return [] as typeof chartData.yearlyActivity;
    }

    const window = selectedCreationRange.window;
    if (!window) {
      return data;
    }

    const maxYear = data[data.length - 1]?.year ?? 0;
    const minYear = maxYear - window + 1;
    return data.filter(item => item.year >= minYear);
  }, [chartData.yearlyActivity, selectedCreationRange]);

  const creationBarMax = useMemo(() => {
    return filteredCreationData.reduce((max, item) => Math.max(max, item.newChannels), 0);
  }, [filteredCreationData]);

  const creationLineMax = useMemo(() => {
    return filteredCreationData.reduce((max, item) => Math.max(max, item.cumulativeChannels), 0);
  }, [filteredCreationData]);

  const filteredGrowthPotentialChannels = useMemo(() => {
    if (!selectedGrowthPreset) {
      return [] as typeof chartData.growthPotentialCandidates;
    }

    const { minSubs, maxSubs, minEngagement, limit } = selectedGrowthPreset;

    return chartData.growthPotentialCandidates
      .filter(channel => channel.subscribers >= minSubs && channel.subscribers <= maxSubs)
      .filter(channel => channel.engagementRate >= minEngagement)
      .sort((a, b) => b.engagementRate - a.engagementRate)
      .slice(0, limit ?? 12);
  }, [chartData.growthPotentialCandidates, selectedGrowthPreset]);

  const growthTierLegend = useMemo(() => {
    const unique = new Map<string, { id: string; label: string; color: string }>();
    filteredGrowthPotentialChannels.forEach(channel => {
      if (!unique.has(channel.tierId)) {
        unique.set(channel.tierId, {
          id: channel.tierId,
          label: channel.tierLabel,
          color: channel.tierColor,
        });
      }
    });
    return Array.from(unique.values());
  }, [filteredGrowthPotentialChannels]);

  const growthChartHeight = useMemo(() => {
    const base = filteredGrowthPotentialChannels.length * 36;
    return Math.max(260, base || 0);
  }, [filteredGrowthPotentialChannels]);

  const growthSubtitle = useMemo(() => {
    if (!selectedGrowthPreset) {
      return 'High engagement channels';
    }

    const min = formatNumber(selectedGrowthPreset.minSubs);
    const max = selectedGrowthPreset.maxSubs === Infinity
      ? '1M+'
      : formatNumber(selectedGrowthPreset.maxSubs);
    return `High engagement channels with ${min}-${max} subscribers and ≥${selectedGrowthPreset.minEngagement} views per subscriber`;
  }, [selectedGrowthPreset]);

  // sorted list of channel names
  const scatterChannelOptions = useMemo(() => {
    const uniqueNames = Array.from(new Set(chartData.scatterData.map(item => item.name)));
    return uniqueNames.sort((a, b) => a.localeCompare(b));
  }, [chartData.scatterData]);


  // default 50-point cap when no filter
  const filteredScatterData = useMemo(() => {
    if (selectedScatterChannels.length === 0) {
      return chartData.scatterData.slice(0, 50);
    }

    const selectedSet = new Set(selectedScatterChannels);
    return chartData.scatterData.filter(item => selectedSet.has(item.name));
  }, [chartData.scatterData, selectedScatterChannels]);

  const scatterViewStats = useMemo(() => {
    if (filteredScatterData.length === 0) {
      return { min: 0, max: 0 };
    }

    let min = Infinity;
    let max = -Infinity;

    filteredScatterData.forEach(item => {
      if (item.views < min) min = item.views;
      if (item.views > max) max = item.views;
    });

    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      return { min: 0, max: 0 };
    }

    return { min, max };
  }, [filteredScatterData]);

  const filteredTenureData = useMemo(() => {
    const activeFilters = TENURE_FILTERS.filter(filter => selectedTenureFilters.includes(filter.id));
    if (activeFilters.length === 0) return [];

    return chartData.tenurePerformanceData
      .filter(item =>
        activeFilters.some(filter => item.tenureYears >= filter.min && item.tenureYears < filter.max)
      )
      .filter(item => (item.isActive && tenureActivityFilter.active) || (!item.isActive && tenureActivityFilter.inactive));
  }, [chartData.tenurePerformanceData, selectedTenureFilters, tenureActivityFilter]);

  const tenureSubscriberStats = useMemo(() => {
    if (chartData.tenurePerformanceData.length === 0) {
      return { min: 0, max: 0 };
    }

    let min = Infinity;
    let max = -Infinity;

    chartData.tenurePerformanceData.forEach(item => {
      if (item.subscribers < min) min = item.subscribers;
      if (item.subscribers > max) max = item.subscribers;
    });

    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      return { min: 0, max: 0 };
    }

    return { min, max };
  }, [chartData.tenurePerformanceData]);


  const handleScatterSelectChannel = useCallback((channelName: string) => {
    setSelectedScatterChannels(prev => (prev.includes(channelName) ? prev : [...prev, channelName]));
  }, []);




  const handleScatterRemoveChannel = useCallback((channelName: string) => {
    setSelectedScatterChannels(prev => prev.filter(name => name !== channelName));
  }, []);

  const handleTenureFilterToggle = (filterId: string) => {
    setSelectedTenureFilters(prev =>
      prev.includes(filterId) ? prev.filter(id => id !== filterId) : [...prev, filterId]
    );
  };

  const handleTenureFilterReset = () => {
    setSelectedTenureFilters(TENURE_FILTERS.filter(filter => filter.id !== '10plus').map(filter => filter.id));
  };

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="text-sm font-medium text-black">{payload[0]?.payload?.fullName || label}</p>
          {payload.map((entry: TooltipPayloadEntry, index: number) => (
            <p key={index} className="text-sm text-black">
              <span style={{ color: entry.color }}>●</span> {`${entry.dataKey}: ${formatNumber(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
      {/* Activity Status Distribution Pie Chart */}
      <div className="order-1 bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Channel Activity Status</h3>
            <p className="mt-1 text-sm text-gray-500">Upload recency and overall activity mix</p>
          </div>
          {activityTrend && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                activityTrend.diff >= 0
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {activityTrend.diff >= 0 ? '+' : ''}
              {activityTrend.diff.toFixed(1)} pts vs {activityTrend.baselineYear}
            </span>
          )}
        </div>

        {activityFreshness.total === 0 ? (
          <>
            <div className="mt-6 flex h-56 items-center justify-center rounded border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-500">
              No recent upload data yet.
            </div>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {chartData.activityData.map(item => (
                <div key={item.id} className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                  <div className="flex items-center gap-2 font-medium text-gray-900">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </div>
                  <div className="text-right text-xs text-gray-600">
                    <div className="font-semibold text-gray-900">{formatNumber(item.value)}</div>
                    <div>{item.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-start">
            <div className="relative mx-auto h-64 w-64 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activityFreshness.segments}
                    innerRadius={60}
                    outerRadius={92}
                    dataKey="value"
                    paddingAngle={3}
                    stroke="none"
                  >
                    {activityFreshness.segments.map(segment => (
                      <Cell key={segment.id} fill={segment.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, _name: string, tooltipItem) => {
                      const segment = tooltipItem?.payload as FreshnessSegment | undefined;
                      const label = segment ? segment.label : 'Upload recency';
                      const share = segment ? `${segment.share.toFixed(1)}%` : null;
                      const display = `${formatNumber(typeof value === 'number' ? value : 0)} channels`;
                      return share ? [display, `${label} (${share})`] : [display, label];
                    }}
                    labelFormatter={() => 'Upload recency'}
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px', color: 'black' }}
                    labelStyle={{ color: 'black' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-semibold text-gray-900">
                  {chartData.activitySummary.activePercentage}%
                </span>
                <span className="mt-1 text-xs uppercase tracking-wide text-gray-500">Active share</span>
              </div>
              <div className="mt-4 flex flex-col items-center space-y-1 text-center text-xs text-gray-600">
                {activityFreshness.dominant ? (
                  <div>
                    Most common: {activityFreshness.dominant.label} ({activityFreshness.dominant.share}%)
                  </div>
                ) : null}
                <div className="text-gray-400">
                  {formatNumber(activityFreshness.total)} channels with upload history
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div className="grid gap-2 sm:grid-cols-2">
                {chartData.activityData.map(item => (
                  <div key={item.id} className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                    <div className="flex items-center gap-2 font-medium text-gray-900">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </div>
                    <div className="text-right text-xs text-gray-600">
                      <div className="font-semibold text-gray-900">{formatNumber(item.value)}</div>
                      <div>{item.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {activityFreshness.segments.map(segment => (
                  <div key={segment.id} className="flex flex-col gap-2 rounded-md border border-gray-200 px-3 py-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 font-medium text-gray-900">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: segment.color }} />
                        {segment.label}
                      </span>
                      <span className="text-xs text-gray-600">{segment.share}%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span className="font-semibold text-gray-900">{formatNumber(segment.value)} channels</span>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1">
                          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          {formatNumber(segment.active)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-slate-400" />
                          {formatNumber(segment.inactive)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Channel Size Categories */}
      <div className="order-2 bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold mb-1 text-gray-900">Channel Size Mix</h3>
        <p className="text-sm text-gray-500 mb-4">{formatNumber(chartData.channelSizeTotal)} channels by subscriber tier</p>
        {chartData.channelSizeSegments.length === 0 ? (
          <div className="flex h-56 items-center justify-center rounded border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-500">
            No subscriber tier data available.
          </div>
        ) : (
          <>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={chartData.channelSizeStackedData}
                  margin={{ top: 16, right: 20, left: 20, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value.toFixed(2)}%`}
                    stroke="#94a3b8"
                  />
                  <YAxis type="category" dataKey="group" hide />
                  <Tooltip
                    formatter={(value: number, dataKey: string) => {
                      const segment = chartData.channelSizeSegments.find(item => item.id === dataKey);
                      if (!segment) {
                        return [value, dataKey];
                      }
                      const percentage = segment.percentage.toFixed(2);
                      return [
                        `${formatNumber(segment.count)} channels`,
                        `${segment.label} (${percentage}%)`,
                      ];
                    }}
                    labelFormatter={() => 'Subscriber Tier Mix'}
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #cbd5f5', borderRadius: '4px', color: 'black' }}
                    labelStyle={{ color: 'black' }}
                  />
                  {chartData.channelSizeSegments.map((segment, index) => {
                    const isFirst = index === 0;
                    const isLast = index === chartData.channelSizeSegments.length - 1;
                    const radius: [number, number, number, number] = [
                      isFirst ? 6 : 0,
                      isLast ? 6 : 0,
                      isLast ? 6 : 0,
                      isFirst ? 6 : 0,
                    ];
                    return (
                      <Bar
                        key={segment.id}
                        dataKey={segment.id}
                        stackId="channelSize"
                        fill={segment.color}
                        radius={radius}
                      />
                    );
                  })}
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-3">
              {chartData.channelSizeSegments.map(segment => (
                <div key={segment.id} className="flex items-center justify-between text-sm text-gray-700">
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
                    <span className="font-medium text-gray-900">{segment.label}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-gray-900">{formatNumber(segment.count)}</span>
                    <span className="text-xs text-gray-500">{segment.percentage.toFixed(2)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      {/* Subscribers vs Views Scatter Plot */}
      <div className="order-7 bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Subscribers vs Views Correlation</h3>
        <ScatterSearchInput
          onChannelSelect={handleScatterSelectChannel}
          onChannelRemove={handleScatterRemoveChannel}
          onClearAll={() => setSelectedScatterChannels([])}
          selectedChannels={selectedScatterChannels}
          allChannels={scatterChannelOptions}
          placeholder="Search for VTuber channels here..."
        />
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart data={filteredScatterData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="subscribers"
              type="number"
              tickFormatter={formatNumber}
              tick={{ fontSize: 12, fill: 'var(--chart-text-color, #374151)' }}
              name="Subscribers"
            />
            <YAxis
              dataKey="views"
              type="number"
              tickFormatter={formatNumber}
              tick={{ fontSize: 12, fill: 'var(--chart-text-color, #374151)' }}
              name="Views"
            />
            <ZAxis
              type="number"
              dataKey="ratio"
              range={[40, 260]}
              name="Views per Subscriber"
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={(props: CustomTooltipProps) => {
                const { active, payload } = props;
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded shadow-lg">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{data.name}</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">Subscribers: {formatNumber(data.subscribers || 0)}</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">Views: {formatNumber(data.views || 0)}</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">Ratio: {(data.ratio || 0).toFixed(1)} views/subscriber</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter data={filteredScatterData}>
              {filteredScatterData.map((entry, index) => {
                const range = scatterViewStats.max - scatterViewStats.min;
                const ratio = range === 0
                  ? 0
                  : Math.min(
                      Math.max((entry.views - scatterViewStats.min) / range, 0),
                      1
                    );
                const fill = scatterColorFromRatio(ratio);
                return <Cell key={`scatter-bubble-${index}`} fill={fill} />;
              })}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Channel Tenure vs Performance */}
      <div className="order-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold mb-2 text-gray-900">Channel Tenure vs Performance</h3>
        <p className="text-sm text-gray-600 mb-3">Channel age in years vs subscriber base, bubble size reflects total views</p>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {TENURE_FILTERS.map(filter => {
            const checked = selectedTenureFilters.includes(filter.id);
            return (
              <label key={filter.id} className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleTenureFilterToggle(filter.id)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {filter.label}
              </label>
            );
          })}
          <button
            type="button"
            onClick={handleTenureFilterReset}
            className="text-sm text-blue-600 underline-offset-2 hover:underline"
          >
            Reset
          </button>
          <div className="ml-auto flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={tenureActivityFilter.active}
                onChange={() => toggleTenureActivity('active')}
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              Active
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={tenureActivityFilter.inactive}
                onChange={() => toggleTenureActivity('inactive')}
                className="h-4 w-4 rounded border-gray-300 text-slate-600 focus:ring-slate-500"
              />
              Inactive
            </label>
          </div>
        </div>
        {filteredTenureData.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center rounded border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-500">
            Select at least one tenure range to see channel performance.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={filteredTenureData} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="tenureYears"
                name="Channel Age"
                tickFormatter={(value: number) => `${value < 5 ? value.toFixed(1) : Math.round(value)}y`}
                tick={{ fontSize: 12, fill: 'var(--chart-text-color, #374151)' }}
                domain={[0, 'dataMax']}
              />
              <YAxis
                type="number"
                dataKey="subscribers"
                name="Subscribers"
                tickFormatter={formatNumber}
                tick={{ fontSize: 12, fill: 'var(--chart-text-color, #374151)' }}
              />
              <ZAxis
                type="number"
                dataKey="views"
                range={[60, 400]}
                name="Total Views"
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as typeof filteredTenureData[number];
                    return (
                      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded shadow-lg">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{data.name}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">Channel age: {data.tenureYears.toFixed(1)} years</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">Subscribers: {formatNumber(data.subscribers)}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">Views: {formatNumber(data.views)}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">Active: {data.isActive ? 'Yes' : 'No'}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter data={filteredTenureData}>
                {filteredTenureData.map((entry, index) => {
                  const range = tenureSubscriberStats.max - tenureSubscriberStats.min;
                  const ratio = range === 0
                    ? 0
                    : Math.min(
                        Math.max((entry.subscribers - tenureSubscriberStats.min) / range, 0),
                        1
                      );
                  const fill = tenureColorFromRatio(ratio);
                  return <Cell key={`tenure-bubble-${index}`} fill={fill} />;
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Channel Creation Timeline */}
      <div className="order-10 bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Channel Creation Timeline</h3>
            <p className="mt-1 text-sm text-gray-600">Yearly onboarding trend with cumulative growth</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {CREATION_RANGE_OPTIONS.map(option => {
                const isActive = option.id === creationRangeId;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setCreationRangeId(option.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      isActive
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:text-blue-700'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">New channels this year</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">{formatNumber(creationSummary.currentYearNew)}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Avg per year (last 5)</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">{creationSummary.last5Average.toFixed(1)}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Peak year</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {creationSummary.peakYear ?? '—'}
                <span className="ml-2 text-sm font-medium text-gray-500">
                  {creationSummary.peakYearNew ? `${formatNumber(creationSummary.peakYearNew)} new` : ''}
                </span>
              </p>
            </div>
          </div>

          {filteredCreationData.length === 0 ? (
            <div className="flex h-56 items-center justify-center rounded border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-500">
              No channel creation data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={filteredCreationData} margin={{ top: 20, right: 32, left: 16, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fontSize: 12, fill: 'var(--chart-text-color, #374151)' }} />
                <YAxis
                  yAxisId="yearly"
                  allowDecimals={false}
                  tickFormatter={formatNumber}
                  tick={{ fontSize: 12, fill: 'var(--chart-text-color, #374151)' }}
                  domain={[0, creationBarMax === 0 ? 5 : Math.ceil(creationBarMax * 1.2)]}
                />
                <YAxis
                  yAxisId="cumulative"
                  orientation="right"
                  allowDecimals={false}
                  tickFormatter={formatNumber}
                  tick={{ fontSize: 12, fill: 'var(--chart-text-color, #374151)' }}
                  domain={[0, creationLineMax === 0 ? 10 : Math.ceil(creationLineMax * 1.05)]}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || payload.length === 0) {
                      return null;
                    }

                    const yearlyEntry = payload.find(entry => entry.dataKey === 'newChannels');
                    const cumulativeEntry = payload.find(entry => entry.dataKey === 'cumulativeChannels');
                    const activeEntry = payload.find(entry => entry.dataKey === 'activeChannels');
                    const activeShareEntry = payload.find(entry => entry.dataKey === 'activeShare');

                    const yearlyValue = typeof yearlyEntry?.value === 'number' ? yearlyEntry.value : 0;
                    const cumulativeValue = typeof cumulativeEntry?.value === 'number' ? cumulativeEntry.value : 0;
                    const activeValue = typeof activeEntry?.value === 'number' ? activeEntry.value : 0;
                    const activeShareValue = typeof activeShareEntry?.value === 'number' ? activeShareEntry.value : 0;

                    return (
                      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded shadow-lg">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">New channels: {formatNumber(yearlyValue)}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">Still active: {formatNumber(activeValue)} ({activeShareValue.toFixed(1)}%)</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">Cumulative total: {formatNumber(cumulativeValue)}</p>
                      </div>
                    );
                  }}
                />
                <Bar yAxisId="yearly" dataKey="newChannels" fill="#f97316" radius={[4, 4, 0, 0]} barSize={28} />
                <Line
                  yAxisId="cumulative"
                  type="monotone"
                  dataKey="cumulativeChannels"
                  stroke="#ea580c"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Engagement Rate Distribution */}
      <div className="order-9 bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Engagement Rate Distribution</h3>
            <p className="mt-1 text-sm text-gray-600">Views per subscriber ratio across all channels</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Median bucket</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {engagementTotals.medianLabel}
                <span className="ml-2 text-sm font-medium text-gray-500">
                  ({engagementTotals.medianShare.toFixed(1)}%)
                </span>
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">High engagement (≥501x)</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {formatNumber(engagementTotals.highEngagementCount)}
                <span className="ml-2 text-sm font-medium text-gray-500">
                  ({engagementTotals.highEngagementShare.toFixed(1)}%)
                </span>
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Low engagement (≤100x)</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {formatNumber(engagementTotals.lowEngagementCount)}
                <span className="ml-2 text-sm font-medium text-gray-500">
                  ({engagementTotals.lowEngagementShare.toFixed(1)}%)
                </span>
              </p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={chartData.engagementData} margin={{ top: 20, right: 32, left: 16, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" tick={{ fontSize: 12, fill: 'var(--chart-text-color, #374151)' }} />
              <YAxis
                yAxisId="count"
                allowDecimals={false}
                tickFormatter={formatNumber}
                tick={{ fontSize: 12, fill: 'var(--chart-text-color, #374151)' }}
                domain={[0, engagementTotals.total === 0 ? 10 : Math.ceil(engagementTotals.total * 0.4)]}
              />
              <YAxis
                yAxisId="share"
                orientation="right"
                tickFormatter={(value: number) => `${value}%`}
                tick={{ fontSize: 12, fill: 'var(--chart-text-color, #374151)' }}
                domain={[0, 100]}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || payload.length === 0) {
                    return null;
                  }

                  const countEntry = payload.find(entry => entry.dataKey === 'count');
                  const shareEntry = payload.find(entry => entry.dataKey === 'share');
                  const countValue = typeof countEntry?.value === 'number' ? countEntry.value : 0;
                  const shareValue = typeof shareEntry?.value === 'number' ? shareEntry.value : 0;

                  return (
                    <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded shadow-lg">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">Channels: {formatNumber(countValue)}</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">Share: {shareValue.toFixed(1)}%</p>
                    </div>
                  );
                }}
              />
              <Bar yAxisId="count" dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={28} />
              <Area
                yAxisId="share"
                type="monotone"
                dataKey="share"
                stroke="#7c3aed"
                strokeWidth={2}
                fill="#c4b5fd"
                fillOpacity={0.25}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Active Share by Subscriber Tier */}
      <div className="order-3 bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Active Share by Subscriber Tier</h3>
              <p className="mt-1 text-sm text-gray-600">90-day activity split across tier cohorts</p>
            </div>
            <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[#22c55e]" /> Active
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[#94a3b8]" /> Inactive
              </span>
              <span className="inline-flex items-center gap-1 text-blue-600">
                <span className="h-1 w-3 rounded bg-blue-600" /> Overall benchmark
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Network active share</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">{overallActiveShare.toFixed(1)}%</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Most active tier</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {(() => {
                  const sorted = [...chartData.tierActivityData].sort((a, b) => b.activePercentage - a.activePercentage);
                  const top = sorted[0];
                  if (!top) return '—';
                  return `${top.name} (${top.activePercentage.toFixed(1)}%)`;
                })()}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Largest cohort</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {(() => {
                  const sorted = [...chartData.tierActivityData].sort((a, b) => b.total - a.total);
                  const top = sorted[0];
                  if (!top) return '—';
                  return `${top.name} (${formatNumber(top.total)} channels)`;
                })()}
              </p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={340}>
            <ComposedChart data={tierActivityChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--chart-text-color, #374151)' }} interval={0} height={70} angle={-20} textAnchor="end" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--chart-text-color, #374151)' }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || payload.length === 0) {
                    return null;
                  }

                  const activeEntry = payload.find(entry => entry.dataKey === 'active');
                  const inactiveEntry = payload.find(entry => entry.dataKey === 'inactive');
                  const benchmarkEntry = payload.find(entry => entry.dataKey === 'benchmark');
                  const ratioEntry = payload.find(entry => entry.dataKey === 'activePercentage');

                  const activeValue = typeof activeEntry?.value === 'number' ? activeEntry.value : 0;
                  const inactiveValue = typeof inactiveEntry?.value === 'number' ? inactiveEntry.value : 0;
                  const ratioValue = typeof ratioEntry?.value === 'number' ? ratioEntry.value : 0;
                  const benchmarkValue = typeof benchmarkEntry?.value === 'number' ? benchmarkEntry.value : overallActiveShare;
                  const total = activeValue + inactiveValue;
                  const share = total > 0 ? (activeValue / total) * 100 : 0;

                  return (
                    <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded shadow-lg">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">Channels: {formatNumber(total)}</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">Active: {formatNumber(activeValue)} ({share.toFixed(1)}%)</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">Inactive: {formatNumber(inactiveValue)}</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">Benchmark: {benchmarkValue.toFixed(1)}%</p>
                    </div>
                  );
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="active" stackId="activityShare" fill="#22c55e" name="Active (≤90d)">
                <LabelList
                  dataKey="total"
                  position="top"
                  offset={6}
                  style={{ fill: 'var(--chart-text-color, #374151)', fontSize: 11 }}
                  formatter={(value) => {
                    const numericValue = typeof value === 'number' ? value : Number(value);
                    if (!Number.isFinite(numericValue)) {
                      return value;
                    }
                    return `N=${formatNumber(numericValue)}`;
                  }}
                />
              </Bar>
              <Bar dataKey="inactive" stackId="activityShare" fill="#94a3b8" name="Inactive (>90d)" />
              <Line
                type="monotone"
                dataKey="activePercentage"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Tier active %"
              />
              <Line
                type="monotone"
                dataKey="benchmark"
                stroke="#0ea5e9"
                strokeDasharray="4 4"
                strokeWidth={2}
                name="Network benchmark"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Channels Leaderboard */}
      <div className="order-5 bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Top Channels Leaderboard</h3>
            <p className="mt-1 text-sm text-gray-600">{topChannelsSubtitle}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {TOP_CHANNEL_METRICS.map(metric => {
                const isActive = metric.id === topChannelMetricId;
                return (
                  <button
                    key={metric.id}
                    type="button"
                    onClick={() => setTopChannelMetricId(metric.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      isActive
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:text-blue-700'
                    }`}
                  >
                    {metric.label}
                  </button>
                );
              })}
            </div>
          </div>

          {topTierLegend.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
              {topTierLegend.map(tier => (
                <span key={tier.id} className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tier.color }} />
                  {tier.label}
                </span>
              ))}
            </div>
          )}

          {topChannelsData.length === 0 ? (
            <div className="flex h-56 items-center justify-center rounded border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-500">
              No channels available yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={topChannelsChartHeight}>
              <BarChart
                layout="vertical"
                data={topChannelsData}
                margin={{ top: 12, right: 36, left: 12, bottom: 12 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  tickFormatter={selectedTopChannelMetric?.axisTickFormatter}
                  domain={[0, topChannelsDomainMax]}
                  height={40}
                  tick={{ fontSize: 12, fill: 'var(--chart-text-color, #374151)' }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={200}
                  tick={{ fontSize: 12, fill: 'var(--chart-text-color, #374151)' }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(14, 116, 144, 0.08)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as typeof topChannelsData[number];
                      return (
                        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded shadow-lg">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{data.fullName}</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">Tier: {data.tierLabel}</p>
                          {selectedTopChannelMetric && (
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {selectedTopChannelMetric.label}:{' '}
                              {selectedTopChannelMetric.valueFormatter(data.metricValue)}
                            </p>
                          )}
                          <p className="text-sm text-gray-700 dark:text-gray-300">Subscribers: {formatNumber(data.subscribers)}</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">Total views: {formatNumber(data.views)}</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">Engagement: {data.engagementRate.toFixed(1)} views/sub</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="metricValue" radius={[0, 4, 4, 0]} barSize={18}>
                  <LabelList
                    dataKey="metricValue"
                    position="right"
                    offset={8}
                    style={{ fill: 'var(--chart-text-color, #374151)', fontSize: 12 }}
                    formatter={(value) => {
                      if (!selectedTopChannelMetric) {
                        return value;
                      }

                      const numericValue = typeof value === 'number' ? value : Number(value);
                      if (!Number.isFinite(numericValue)) {
                        return value;
                      }

                      return selectedTopChannelMetric.valueFormatter(numericValue);
                    }}
                  />
                  {topChannelsData.map(channel => (
                    <Cell key={channel.fullName} fill={channel.tierColor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Growth Potential Analysis */}
      <div className="order-6 bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold mb-2 text-gray-900">Growth Potential Channels</h3>
        <p className="text-sm text-gray-600 mb-4">{growthSubtitle}</p>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          {GROWTH_PRESETS.map(preset => {
            const isSelected = preset.id === selectedGrowthPresetId;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedGrowthPresetId(preset.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:text-blue-700'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {growthTierLegend.length > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
            {growthTierLegend.map(tier => (
              <span key={tier.id} className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tier.color }} />
                {tier.label}
              </span>
            ))}
          </div>
        )}

        {filteredGrowthPotentialChannels.length === 0 ? (
          <div className="flex h-56 items-center justify-center rounded border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-500">
            No channels meet the selected criteria yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={growthChartHeight}>
            <BarChart
              layout="vertical"
              data={filteredGrowthPotentialChannels}
              margin={{ top: 12, right: 32, left: 12, bottom: 12 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis
                type="number"
                tickFormatter={(value: number) => `${Math.round(value)}x`}
                tick={{ fontSize: 12, fill: 'var(--chart-text-color, #374151)' }}
                domain={[0, 'dataMax']}
                height={40}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={170}
                tick={{ fontSize: 12, fill: 'var(--chart-text-color, #374151)' }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as typeof filteredGrowthPotentialChannels[number];
                    return (
                      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded shadow-lg">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{data.fullName}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">Tier: {data.tierLabel}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">Subscribers: {formatNumber(data.subscribers)}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">Total views: {formatNumber(data.views)}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">Engagement: {data.engagementRate.toFixed(1)} views/sub</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="engagementRate" radius={[0, 4, 4, 0]} barSize={18}>
                {filteredGrowthPotentialChannels.map(channel => (
                  <Cell key={channel.fullName} fill={channel.tierColor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Content Freshness Timeline */}
      <div className="order-4 bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Content Freshness Timeline</h3>
            <p className="mt-1 text-sm text-gray-600">When channels last published new content</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {FRESHNESS_PRESETS.map(preset => {
                  const isSelected = preset.id === selectedFreshnessPresetId;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedFreshnessPresetId(preset.id)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:text-blue-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Uploaded in last 7 days</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {formatNumber(freshnessSummary.last7)}
                <span className="ml-2 text-sm font-medium text-gray-500">
                  ({freshnessSummary.last7Percent.toFixed(1)}%)
                </span>
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Uploaded in last 30 days</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {formatNumber(freshnessSummary.last30)}
                <span className="ml-2 text-sm font-medium text-gray-500">
                  ({freshnessSummary.last30Percent.toFixed(1)}%)
                </span>
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Dormant 90+ days</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {formatNumber(freshnessSummary.ninetyPlus)}
                <span className="ml-2 text-sm font-medium text-gray-500">
                  ({freshnessSummary.ninetyPlusPercent.toFixed(1)}%)
                </span>
              </p>
            </div>
          </div>

          {freshnessChartData.length === 0 ? (
            <div className="flex h-56 items-center justify-center rounded border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-500">
              No channels in this segment yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={freshnessChartData} margin={{ top: 20, right: 32, left: 16, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" tick={{ fontSize: 12, fill: 'var(--chart-text-color, #374151)' }} />
                <YAxis
                  yAxisId="count"
                  allowDecimals={false}
                  tickFormatter={formatNumber}
                  tick={{ fontSize: 12, fill: 'var(--chart-text-color, #374151)' }}
                  domain={[0, freshnessChartMaxCount === 0 ? 10 : Math.ceil(freshnessChartMaxCount * 1.1)]}
                />
                <YAxis
                  yAxisId="share"
                  orientation="right"
                  tickFormatter={(value: number) => `${value}%`}
                  tick={{ fontSize: 12, fill: 'var(--chart-text-color, #374151)' }}
                  domain={[0, 100]}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || payload.length === 0) {
                      return null;
                    }

                    const countEntry = payload.find(entry => entry.dataKey === 'count');
                    const percentageEntry = payload.find(entry => entry.dataKey === 'percentage');
                    const countValue = typeof countEntry?.value === 'number' ? countEntry.value : 0;
                    const percentageValue = typeof percentageEntry?.value === 'number' ? percentageEntry.value : 0;

                    return (
                      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded shadow-lg">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">Channels: {formatNumber(countValue)}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">Share: {percentageValue.toFixed(1)}%</p>
                      </div>
                    );
                  }}
                />
                <Bar yAxisId="count" dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={28} />
                <Area
                  yAxisId="share"
                  type="monotone"
                  dataKey="percentage"
                  stroke="#0284c7"
                  strokeWidth={2}
                  fill="#38bdf8"
                  fillOpacity={0.25}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
