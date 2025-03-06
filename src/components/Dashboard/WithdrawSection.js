'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { validateWalletAddress } from '@/config/wallets';

export default function WithdrawSection() {
  const [amount, setAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [eligibility, setEligibility] = useState(null);

  useEffect(() => {
    checkEligibility();
  }, []);

  const checkEligibility = async () => {
    try {
      const response = await fetch('/api/withdrawal/eligibility');
      const data = await response.json();
      setEligibility(data);
    } catch (error) {
      console.error('Error checking eligibility:', error);
      toast.error('Failed to check withdrawal eligibility');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate wallet address
      if (!validateWalletAddress(walletAddress, 'USDT')) {
        toast.error('Please enter a valid USDT (TRC20) wallet address');
        setSubmitting(false);
        return;
      }

      const response = await fetch('/api/withdrawal/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          walletAddress: walletAddress.trim() // Ensure no whitespace
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Withdrawal request submitted successfully');
        setAmount('');
        setWalletAddress('');
        checkEligibility(); // Refresh eligibility
      } else {
        toast.error(data.message || 'Failed to submit withdrawal request');
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast.error('Failed to process withdrawal');
    } finally {
      setSubmitting(false);
    }
  };

  if (!eligibility) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow max-w-xl mx-auto">
      <h2 className="text-xl font-semibold text-white mb-4">Withdraw Funds</h2>
      
      {!eligibility ? (
        <p>Loading...</p>
      ) : !eligibility.eligible ? (
        <p className="text-red-400">{eligibility.message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-300">
              USDT (TRC20) Wallet Address
            </label>
            <input
              type="text"
              id="walletAddress"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
              placeholder="Enter your USDT TRC20 wallet address"
              required
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-300">
              Amount (USD)
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
              className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
              required
            />
            <p className="mt-1 text-sm text-gray-400">
              Available for withdrawal: ${eligibility.availableProfit}
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-600"
          >
            {submitting ? 'Processing...' : 'Withdraw'}
          </button>
        </form>
      )}
    </div>
  );
} 