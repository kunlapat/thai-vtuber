'use client';

import { useMemo } from 'react';
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
} from 'recharts';
import { VTuberChannel, CustomTooltipProps, TooltipPayloadEntry } from '@/types/vtuber';
import { formatNumber } from '@/utils/vtuberStats';

interface VTuberChartsProps {
  channels: VTuberChannel[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const VTuberCharts = ({ channels }: VTuberChartsProps) => {
  const chartData = useMemo(() => {
    // Top 10 channels by subscribers
    const topChannels = [...channels]
      .sort((a, b) => b.subscribers - a.subscribers)
      .slice(0, 10)
      .map(channel => ({
        name: channel.title.length > 15 ? channel.title.slice(0, 15) + '...' : channel.title,
        fullName: channel.title,
        subscribers: channel.subscribers,
        views: channel.views,
      }));

    // Rebranded vs Original channels
    const rebrandedData = [
      {
        name: 'Original',
        value: channels.filter(c => !c.is_rebranded).length,
        percentage: Math.round((channels.filter(c => !c.is_rebranded).length / channels.length) * 100),
      },
      {
        name: 'Rebranded',
        value: channels.filter(c => c.is_rebranded).length,
        percentage: Math.round((channels.filter(c => c.is_rebranded).length / channels.length) * 100),
      },
    ];

    // Subscribers vs Views scatter data
    const scatterData = channels
      .filter(channel => channel.subscribers > 0 && channel.views > 0)
      .map(channel => ({
        name: channel.title,
        subscribers: channel.subscribers,
        views: channel.views,
        ratio: channel.views / channel.subscribers,
      }))
      .slice(0, 50); // Limit to 50 points for better performance

    // Activity by year
    const activityData = channels.reduce((acc, channel) => {
      const year = new Date(channel.published_at).getFullYear();
      if (year >= 2018) {
        acc[year] = (acc[year] || 0) + 1;
      }
      return acc;
    }, {} as Record<number, number>);

    const yearlyActivity = Object.entries(activityData)
      .map(([year, count]) => ({ year: parseInt(year), channels: count }))
      .sort((a, b) => a.year - b.year);

    return { topChannels, rebrandedData, scatterData, yearlyActivity };
  }, [channels]);

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="text-sm font-medium">{payload[0]?.payload?.fullName || label}</p>
          {payload.map((entry: TooltipPayloadEntry, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${formatNumber(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Channels Bar Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Top 10 Channels by Subscribers</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData.topChannels} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
            />
            <YAxis tickFormatter={formatNumber} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="subscribers" fill="#0088FE" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Rebranded vs Original Pie Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Channel Status Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData.rebrandedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name}: ${percentage}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.rebrandedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Subscribers vs Views Scatter Plot */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Subscribers vs Views Correlation</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart data={chartData.scatterData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="subscribers"
              type="number"
              tickFormatter={formatNumber}
              name="Subscribers"
            />
            <YAxis
              dataKey="views"
              type="number"
              tickFormatter={formatNumber}
              name="Views"
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={(props: CustomTooltipProps) => {
                const { active, payload } = props;
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border rounded shadow-lg">
                      <p className="text-sm font-medium">{data.name}</p>
                      <p className="text-sm">Subscribers: {formatNumber(data.subscribers || 0)}</p>
                      <p className="text-sm">Views: {formatNumber(data.views || 0)}</p>
                      <p className="text-sm">Ratio: {(data.ratio || 0).toFixed(1)} views/subscriber</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter fill="#00C49F" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Channel Creation Timeline */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Channel Creation Timeline</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData.yearlyActivity} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="channels" fill="#FF8042" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

