export const INVESTMENT_PLANS = [
  {
    id: 'starter',
    name: 'Starter Plan',
    minAmount: 1000,
    maxAmount: 4999,
    returnRate: 10, // 10% weekly return
    duration: '7 days',
    features: [
      'Weekly ROI: 10%',
      'Duration: 7 Days',
      '24/7 Support'
    ]
  },
  {
    id: 'basic',
    name: 'Basic Plan',
    minAmount: 5000,
    maxAmount: 9999,
    returnRate: 15, // 15% weekly return
    duration: '7 days',
    features: [
      'Weekly ROI: 15%',
      'Duration: 7 Days',
      'Priority Support'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    minAmount: 10000,
    maxAmount: 49999,
    returnRate: 20, // 20% weekly return
    duration: '7 days',
    features: [
      'Weekly ROI: 20%',
      'Duration: 7 Days',
      'VIP Support'
    ]
  },
  {
    id: 'vip',
    name: 'VIP Plan',
    minAmount: 50000,
    maxAmount: Infinity,
    returnRate: 25, // 25% weekly return
    duration: '7 days',
    features: [
      'Weekly ROI: 25%',
      'Duration: 7 Days',
      'Dedicated Account Manager'
    ]
  }
];

export const getPlanByAmount = (amount) => {
  return INVESTMENT_PLANS.find(
    plan => amount >= plan.minAmount && amount <= plan.maxAmount
  );
}; 