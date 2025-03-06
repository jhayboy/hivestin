'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { INVESTMENT_PLANS, getPlanByAmount } from '@/config/investmentPlans';

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalROI: 0,
    totalInvestment: 0,
    roiPercentage: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all',     // all, deposit, withdrawal
    status: 'all'    // all, completed, pending, failed
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const getPlanName = (planId) => {
    const plan = INVESTMENT_PLANS.find(p => p.id === planId);
    return plan ? plan.name : 'Unknown Plan';
  };

  const fetchTransactions = async () => {
    try {
      setError(null);
      const response = await fetch('/api/transactions/history');
      const data = await response.json();
      
      if (response.ok) {
        setTransactions(data.transactions);
        setStats(data.stats);
      } else {
        toast.error('Failed to load transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transaction history');
      toast.error('Failed to load transaction history');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter transactions based on selected type and status
  const filteredTransactions = transactions.filter(tx => {
    const typeMatch = filters.type === 'all' || tx.type === filters.type;
    const statusMatch = filters.status === 'all' || tx.status === filters.status;
    return typeMatch && statusMatch;
  });

  const getStatusColor = (status, type, isMatured) => {
    if (type === 'deposit' && status === 'completed') {
      return isMatured ? 'text-green-400' : 'text-yellow-400';
    }
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = (transaction) => {
    const { status, type, isMatured, daysToMaturity } = transaction;
    
    if (type === 'deposit' && status === 'completed') {
      if (isMatured) {
        return 'Matured';
      }
      return `Matures in ${daysToMaturity} days`;
    }
    
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getPlanDetails = (amount) => {
    const plan = getPlanByAmount(amount);
    return plan ? {
      name: plan.name,
      returnRate: plan.returnRate
    } : null;
  };

  const formatPlanInfo = (transaction) => {
    if (transaction.type !== 'deposit') return '-';
    const plan = INVESTMENT_PLANS.find(p => p.id === transaction.planId);
    return plan ? `${plan.name} (${plan.returnRate}% weekly)` : '-';
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Transaction History</h2>
        <div className="text-gray-300">Loading transactions...</div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <p className="text-gray-400 text-center">No transactions found</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <p className="text-red-400 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ROI Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-gray-400 text-sm">Total Investment</h3>
          <p className="text-2xl font-bold text-white">
            ${stats.totalInvestment.toFixed(2)}
          </p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-gray-400 text-sm">Total ROI</h3>
          <p className="text-2xl font-bold text-green-500">
            ${stats.totalROI.toFixed(2)}
          </p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-gray-400 text-sm">ROI Percentage</h3>
          <p className="text-2xl font-bold text-blue-500">
            {stats.roiPercentage.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-4 mb-4">
        <select
          value={filters.type}
          onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
          className="bg-gray-700 text-white rounded px-3 py-2"
        >
          <option value="all">All Types</option>
          <option value="deposit">Deposits</option>
          <option value="withdrawal">Withdrawals</option>
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className="bg-gray-700 text-white rounded px-3 py-2"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Plan & ROI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Accumulated ROI
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredTransactions.map((tx) => (
                <tr key={tx._id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {format(new Date(tx.createdAt), 'MMM d, yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    ${tx.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatPlanInfo(tx)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      tx.status === 'completed' ? 'bg-green-900 text-green-200' :
                      tx.status === 'pending' ? 'bg-yellow-900 text-yellow-200' :
                      'bg-red-900 text-red-200'
                    }`}>
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {tx.type === 'deposit' && tx.status === 'completed' && tx.roi ? (
                      <span className="text-green-400">
                        ${((tx.amount * tx.roi) / 100).toFixed(2)}
                      </span>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 