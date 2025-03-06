'use client';
import { useState, useEffect } from 'react';
import { CheckIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { SUPPORTED_WALLETS } from '@/config/wallets';
import { INVESTMENT_PLANS } from '@/config/investmentPlans';

export default function DepositSection() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedCrypto, setSelectedCrypto] = useState('USDT');
  const [step, setStep] = useState(1); // 1 for plan selection, 2 for payment
  const [transactionHash, setTransactionHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasActiveInvestment, setHasActiveInvestment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [isCheckingPlan, setIsCheckingPlan] = useState(true);

  // Wallet details
  const walletAddress = 'TQVxJ3XkFQXzxRHYJhD9VGhkxXP1XBHVXF';

  const WALLET_ADDRESSES = {
    USDT: '0x1234567890abcdef1234567890abcdef12345678',
    BTC: '1FBcC5f2DAbVbf1qZyddPUpW334Dsr74aN'
  };

  useEffect(() => {
    checkActiveInvestment();
  }, []);

  const checkActiveInvestment = async () => {
    try {
      const response = await fetch('/api/investments/active');
      const data = await response.json();
      setHasActiveInvestment(data.hasActiveInvestment);
      setIsCheckingPlan(false);
    } catch (error) {
      console.error('Error checking investment status:', error);
      toast.error('Failed to check investment status');
      setIsCheckingPlan(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handlePlanSelect = (plan) => {
    if (hasActiveInvestment) {
      setShowMigrationModal(true);
      return;
    }
    setSelectedPlan(plan);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!selectedPlan || !transactionHash || !selectedCrypto) {
        toast.error('Please fill in all required fields');
        return;
      }

      const response = await fetch('/api/transactions/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: selectedPlan.minAmount,
          currency: selectedCrypto,
          transactionHash: transactionHash,
          planId: selectedPlan.id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Deposit submitted successfully');
        setTransactionHash('');
        setStep(1);
        // Optionally refresh the page or update UI
      } else {
        toast.error(data.message || 'Failed to submit deposit');
      }
    } catch (error) {
      console.error('Deposit error:', error);
      toast.error('Failed to process deposit');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingPlan) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-white">Checking investment status...</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {/* Investment Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {INVESTMENT_PLANS.map((plan) => (
            <div
              key={plan.id}
      onClick={() => handlePlanSelect(plan)}
      className={`bg-gray-800 rounded-lg p-6 flex flex-col transition-all duration-200
        ${hasActiveInvestment ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:shadow-lg"}`}
            >
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-4">{plan.name}</h3>
                <p className="text-2xl font-bold text-blue-400 mb-4">
                  ${plan.minAmount.toLocaleString()}
                </p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="text-gray-300 flex items-center">
                      <CheckIcon className="h-5 w-5 text-green-400 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              {hasActiveInvestment ? (
                <button
                  onClick={() => handlePlanSelect(plan)}
                  className="w-full hidden bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md transition-colors duration-200 font-medium"
                >
                  Select {plan.name}
                </button>
              ) : (
                <button
                  onClick={() => handlePlanSelect(plan)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md transition-colors duration-200 font-medium"
                >
                  Select {plan.name}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Active Investment Warning */}
        {hasActiveInvestment && (
          <div className="bg-yellow-900/50 border border-yellow-700 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
              <div>
                <p className="text-yellow-100 font-medium">
                  Active Investment Plan Detected
                </p>
                <p className="text-yellow-200/80 text-sm mt-1">
                  You already have an active investment plan. New deposits will be treated as additional investments.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className={`${hasActiveInvestment ? "hidden" : "max-w-2xl mx-auto"}`}>
          <h2 className="text-2xl font-semibold text-white mb-6">
            Deposit for {selectedPlan?.name} - ${selectedPlan?.minAmount.toLocaleString()}
          </h2>
          <div className="bg-gray-800 rounded-lg p-6">
            <select
              value={selectedCrypto}
              onChange={(e) => setSelectedCrypto(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-md p-2 mb-4"
            >
              <option value="USDT">USDT (TRC20)</option>
              <option value="BTC">Bitcoin (BTC)</option>
            </select>

            <div className="bg-amber-900/50 border border-amber-500/50 rounded-md p-4 mb-6">
              <p className="text-amber-200">
                <span className="font-bold">Important:</span> Only send USDT using the TRC20 network. Other networks
                are not supported and may result in lost funds.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-gray-300 mb-2">{selectedCrypto} Wallet Address</label>
              <div className="flex items-center bg-gray-700 rounded-md p-2">
                <span className="text-gray-300 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{WALLET_ADDRESSES[selectedCrypto]}</span>
                <button
                  onClick={() => copyToClipboard(WALLET_ADDRESSES[selectedCrypto])}
                  className="ml-2 text-blue-400 hover:text-blue-300"
                >
                  <ClipboardDocumentIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-300 mb-2">Transaction Hash</label>
              <input
                type="text"
                value={transactionHash}
                onChange={(e) => setTransactionHash(e.target.value)}
                placeholder="Enter your transaction hash"
                className="w-full bg-gray-700 text-white rounded-md p-2"
              />
              <p className="text-gray-400 text-sm mt-1">
                Enter the transaction hash from your wallet after sending the payment
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-700 text-white py-2 rounded-md hover:bg-gray-600"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !transactionHash}
                onClick={handleSubmit}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Deposit'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Migration Modal */}
      <Transition appear show={showMigrationModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setShowMigrationModal(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/75" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-gray-800 p-6 shadow-xl transition-all">
                  <Dialog.Title className="text-lg font-medium text-white mb-4">
                    Active Investment Found
                  </Dialog.Title>
                  <div className="mb-6">
                    <p className="text-gray-300">
                      You already have an active investment plan. To change plans, please contact support for assistance with plan migration.
                    </p>
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-600 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700"
                      onClick={() => setShowMigrationModal(false)}
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
} 