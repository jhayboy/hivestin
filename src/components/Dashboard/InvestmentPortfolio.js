'use client';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function InvestmentPortfolio() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInvested: 0,
    totalProfit: 0,
    activeInvestments: 0,
    averageROI: 0
  });

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    try {
      const response = await fetch('/api/investments');
      const data = await response.json();
      
      if (response.ok) {
        setInvestments(data.investments || []);
        setStats(data.stats || {
          totalInvested: 0,
          totalProfit: 0,
          activeInvestments: 0,
          averageROI: 0
        });
      }
    } catch (error) {
      console.error('Error fetching investments:', error);
      toast.error('Failed to load investment data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-gray-400">Loading investment data...</div>
      </div>
    );
  }

  if (!investments.length) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-white">Investment Portfolio</h2>
        <p className="text-gray-400">No investments found. Start investing to see your portfolio here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Investment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-sm text-gray-400">Total Invested</h3>
          <p className="text-2xl font-bold text-white">${stats.totalInvested.toFixed(2)}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-sm text-gray-400">Total Profit</h3>
          <p className="text-2xl font-bold text-green-400">${stats.totalProfit.toFixed(2)}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-sm text-gray-400">Active Investments</h3>
          <p className="text-2xl font-bold text-white">{stats.activeInvestments}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-sm text-gray-400">Average ROI</h3>
          <p className="text-2xl font-bold text-blue-400">{stats.averageROI}%</p>
        </div>
      </div>

      {/* Active Investments */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Active Investments</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Next Payout</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Total Profit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {investments.map((investment) => (
                <tr key={investment._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {investment.planName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    ${investment.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {format(new Date(investment.startDate), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {format(new Date(investment.nextPayoutDate), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">
                    ${investment.totalProfit.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      investment.status === 'active'
                        ? 'bg-green-900 text-green-200'
                        : 'bg-yellow-900 text-yellow-200'
                    }`}>
                      {investment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profit History */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Profit History</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {investments.slice(0, 3).map((investment) => (
            <div key={investment._id} className="bg-gray-700 p-4 rounded-lg">
              <h3 className="font-medium text-white">{investment.planName}</h3>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-400">
                  Initial Investment: ${investment.amount.toFixed(2)}
                </p>
                <p className="text-sm text-green-400">
                  Total Profit: ${investment.totalProfit.toFixed(2)}
                </p>
                <p className="text-sm text-gray-400">
                  ROI: {((investment.totalProfit / investment.amount) * 100).toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 