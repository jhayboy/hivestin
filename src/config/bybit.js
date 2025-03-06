export const BYBIT_CONFIG = {
  API_KEY: process.env.BYBIT_API_KEY,
  API_SECRET: process.env.BYBIT_API_SECRET,
  TESTNET: process.env.NODE_ENV !== 'production', // Use testnet for development
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://api.bybit.com' 
    : 'https://api-testnet.bybit.com'
};

// Utility function to generate signature for Bybit API
export const generateSignature = (parameters, secret) => {
  const orderedParams = Object.keys(parameters)
    .sort()
    .reduce((obj, key) => {
      obj[key] = parameters[key];
      return obj;
    }, {});

  const queryString = Object.entries(orderedParams)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  const signature = crypto
    .createHmac('sha256', secret)
    .update(queryString)
    .digest('hex');

  return signature;
}; 