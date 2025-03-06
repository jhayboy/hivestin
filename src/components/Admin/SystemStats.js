'use client';
import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';

export default function SystemStats() {
  const [stats, setStats] = useState({
    users: {
      total: 0,
      active: 0,
      pending: 0,
      newToday: 0,
      weeklyGrowth: 0
    },
    finances: {
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalProfit: 0,
      currentBalance: 0,
      weeklyVolume: 0,
      monthlyVolume: 0
    },
    support: {
      totalCalls: 0,
      pendingCalls: 0,
      completedCalls: 0,
      topTopics: []
    },
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('week'); // week, month, year

  useEffect(() => {
    fetchStats();
  }, [timeframe]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/admin/stats?timeframe=${timeframe}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.users.total}
          trend={`${stats.users.weeklyGrowth}% this week`}
          trendUp={stats.users.weeklyGrowth > 0}
        />
        <StatCard
          title="Active Users"
          value={stats.users.active}
          trend={`${((stats.users.active / stats.users.total) * 100).toFixed(1)}% of total`}
          trendUp={true}
        />
        <StatCard
          title="Total Deposits"
          value={`$${stats.finances.totalDeposits.toLocaleString()}`}
          trend={`$${stats.finances.weeklyVolume.toLocaleString()} this week`}
          trendUp={stats.finances.weeklyVolume > 0}
        />
        <StatCard
          title="Total Withdrawals"
          value={`$${stats.finances.totalWithdrawals.toLocaleString()}`}
          trend={`${((stats.finances.totalWithdrawals / stats.finances.totalDeposits) * 100).toFixed(1)}% ratio`}
          trendUp={true}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-white mb-4">User Growth</h3>
          {/* Chart content */}
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-white mb-4">Transaction Volume</h3>
          {/* Chart content */}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-700">
                <div className="text-gray-300">{activity.description}</div>
                <div className="text-gray-400 text-sm">{format(new Date(activity.timestamp), 'MMM d, h:mm a')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, trendUp }) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow">
      <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      <p className={`mt-2 text-sm ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
        {trend}
      </p>
    </div>
  );
} 