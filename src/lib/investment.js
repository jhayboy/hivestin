import { INVESTMENT_PLANS } from '@/config/investmentPlans';

export function calculateROI(amount) {
  const plan = INVESTMENT_PLANS.find(
    p => amount >= p.minAmount && amount <= p.maxAmount
  );
  return plan ? plan.returnRate / 100 : 0.10; // Default to 10% if no plan found
}

export function calculateAccumulatedROI(transactions) {
  let totalROI = 0;
  let totalInvestment = 0;

  transactions.forEach(tx => {
    if (tx.type === 'deposit' && tx.status === 'completed') {
      const depositDate = new Date(tx.createdAt);
      const currentDate = new Date();
      const weeksSinceDeposit = Math.floor(
        (currentDate - depositDate) / (7 * 24 * 60 * 60 * 1000)
      );
      
      const roiRate = calculateROI(tx.amount);
      const roiForDeposit = tx.amount * roiRate * weeksSinceDeposit;
      
      totalROI += roiForDeposit;
      totalInvestment += tx.amount;
    }
  });

  return {
    totalROI,
    totalInvestment,
    roiPercentage: totalInvestment > 0 ? (totalROI / totalInvestment) * 100 : 0
  };
} 