'use client';
import { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';

const INVESTMENT_PLANS = [
  {
    id: 'starter',
    name: 'Starter Plan',
    amount: 1000,
    features: [
      'Weekly ROI: 10%',
      'Instant Withdrawal',
      '24/7 Support',
      'Real-time Analytics'
    ]
  },
  {
    id: 'basic',
    name: 'Basic Plan',
    amount: 5000,
    features: [
      'Weekly ROI: 12%',
      'Priority Support',
      'Investment Consulting',
      'Portfolio Management'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    amount: 10000,
    features: [
      'Weekly ROI: 15%',
      'VIP Support',
      'Dedicated Manager',
      'Advanced Analytics'
    ]
  },
  {
    id: 'vip',
    name: 'VIP Plan',
    amount: 50000,
    features: [
      'Weekly ROI: 20%',
      'Exclusive VIP Support',
      'Dedicated Account Manager',
      'Custom Investment Strategy'
    ]
  }
];

export default function InvestmentPlans() {
  const [hasActiveInvestment, setHasActiveInvestment] = useState(false);
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    checkActiveInvestment();
  }, []);

  const checkActiveInvestment = async () => {
    try {
      const response = await fetch('/api/investments/active');
      const data = await response.json();
      setHasActiveInvestment(data.hasActiveInvestment);
    } catch (error) {
      console.error('Error checking active investment:', error);
    }
  };

  const handleSelectPlan = (plan) => {
    if (hasActiveInvestment) {
      setSelectedPlan(plan);
      setShowMigrationModal(true);
      return;
    }
    window.location.href = `/dashboard?plan=${plan.id}&amount=${plan.amount}`;
  };

  return (
    <>
      <h2 className="text-2xl font-semibold text-white mb-6">Select Investment Plan</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
        {INVESTMENT_PLANS.map((plan) => (
          <div
            key={plan.id}
            className="bg-gray-800 rounded-lg p-6 flex flex-col"
          >
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-4">{plan.name}</h3>
              <p className="text-2xl font-bold text-blue-500 mb-6">
                ${plan.amount.toLocaleString()}
              </p>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-300">
                    <CheckIcon className="h-5 w-5 text-blue-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => handleSelectPlan(plan)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 text-center font-medium"
            >
              Select {plan.name}
            </button>
          </div>
        ))}
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
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium text-white mb-4"
                  >
                    Active Investment Found
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-gray-300">
                      You currently have an active investment plan. To migrate to a higher plan,
                      please contact our support team for assistance.
                    </p>
                    {selectedPlan && (
                      <p className="mt-2 text-gray-400">
                        Selected plan: {selectedPlan.name} (${selectedPlan.amount.toLocaleString()})
                      </p>
                    )}
                  </div>

                  <div className="mt-6 flex justify-end space-x-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      onClick={() => {
                        setShowMigrationModal(false);
                        window.location.href = '/dashboard/support';
                      }}
                    >
                      Contact Support
                    </button>
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