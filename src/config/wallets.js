export const SUPPORTED_WALLETS = {
  USDT: {
    address: '0x1234567890abcdef1234567890abcdef12345678', // Replace with your actual USDT wallet address
    network: 'TRC20',
    name: 'USDT (Tether)',
    minimumDeposit: 100
  },
  BTC: {
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', // Replace with your actual BTC wallet address
    network: 'Bitcoin',
    name: 'Bitcoin',
    minimumDeposit: 0.001
  },
  ETH: {
    address: '0xabcdef1234567890abcdef1234567890abcdef12', // Replace with your actual ETH wallet address
    network: 'ERC20',
    name: 'Ethereum',
    minimumDeposit: 0.01
  }
};

export const validateWalletAddress = (address, type) => {
  const patterns = {
    BTC: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/,
    ETH: /^0x[a-fA-F0-9]{40}$/,
    USDT: /^T[A-Za-z1-9]{33}$/ // TRC20 USDT address pattern
  };

  return patterns[type]?.test(address) || false;
}; 