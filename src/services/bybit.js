import { BYBIT_CONFIG, generateSignature } from '@/config/bybit';

export class BybitService {
  static async verifyDeposit(txHash, currency) {
    try {
      const timestamp = Date.now();
      const params = {
        api_key: BYBIT_CONFIG.API_KEY,
        timestamp,
        coin: currency,
        txid: txHash
      };

      const signature = generateSignature(params, BYBIT_CONFIG.API_SECRET);
      
      const response = await fetch(`${BYBIT_CONFIG.BASE_URL}/v2/private/deposit/record`, {
        method: 'GET',
        headers: {
          'X-BAPI-SIGN': signature,
          'X-BAPI-API-KEY': BYBIT_CONFIG.API_KEY,
          'X-BAPI-TIMESTAMP': timestamp,
          'X-BAPI-RECV-WINDOW': 5000
        }
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.ret_msg || 'Failed to verify transaction');
      }

      // Find the transaction in the records
      const transaction = data.result.find(tx => 
        tx.tx_id.toLowerCase() === txHash.toLowerCase()
      );

      if (!transaction) {
        return {
          verified: false,
          message: 'Transaction not found'
        };
      }

      return {
        verified: transaction.status === 'success',
        amount: transaction.amount,
        status: transaction.status,
        address: transaction.address
      };
    } catch (error) {
      console.error('Bybit verification error:', error);
      return {
        verified: false,
        message: 'Verification service unavailable',
        error: error.message
      };
    }
  }
} 