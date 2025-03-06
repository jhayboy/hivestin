'use client';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function TransactionApproval() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // pending, completed, failed

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/admin/transactions');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      } else {
        toast.error('Failed to load transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (transactionId) => {
    try {
      const response = await fetch(`/api/admin/transactions/${transactionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Transaction approved successfully');
        fetchTransactions(); // Refresh the list
      } else {
        console.error('Approval error:', data);
        toast.error(data.message || 'Failed to approve transaction');
      }
    } catch (error) {
      console.error('Error approving transaction:', error);
      toast.error('Network error while approving transaction');
    }
  };

  const handleReject = async (transactionId) => {
    try {
      const response = await fetch(`/api/admin/transactions/${transactionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      });

      if (response.ok) {
        toast.success('Transaction rejected successfully');
        fetchTransactions(); // Refresh the list
      } else {
        toast.error('Failed to reject transaction');
      }
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      toast.error('Failed to reject transaction');
    }
  };

  const handleVerify = async (transactionId) => {
    try {
      const response = await fetch(`/api/admin/transactions/${transactionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify' }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Transaction verified successfully');
        fetchTransactions(); // Refresh the list
      } else {
        toast.error(data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Error verifying transaction:', error);
      toast.error('Failed to verify transaction');
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tx.status === filter;
  });

  if (loading) {
    return <div className="p-6 text-center text-gray-300">Loading transactions...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-white mb-4">Transaction Approval</h2>
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-md ${
            filter === 'pending' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-md ${
            filter === 'completed' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Completed
        </button>
        <button
          onClick={() => setFilter('failed')}
          className={`px-4 py-2 rounded-md ${
            filter === 'failed' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Failed
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md ${
            filter === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          All
        </button>
      </div>
      <div className="mt-4 bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Wallet Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 bg-gray-800">
              {transactions.filter(tx => filter === 'all' || tx.status === filter).map((transaction) => (
                <tr key={transaction._id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {transaction.user?.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 capitalize">
                    {transaction.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    ${transaction.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      transaction.status === 'completed' ? 'bg-green-900 text-green-200' :
                      transaction.status === 'pending' ? 'bg-yellow-900 text-yellow-200' :
                      'bg-red-900 text-red-200'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {format(new Date(transaction.createdAt), 'MMM d, yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {transaction.type === 'withdrawal' ? (
                      transaction.walletAddress || 'Not provided'
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {transaction.status === 'pending' && (
                      <div className="space-x-4">
                        <button
                          onClick={() => handleVerify(transaction._id)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          Verify
                        </button>
                        <button
                          onClick={() => handleApprove(transaction._id)}
                          className="text-green-400 hover:text-green-300"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(transaction._id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Reject
                        </button>
                      </div>
                    )}
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