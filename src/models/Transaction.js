import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
    set: v => parseFloat(v.toFixed(2)) // Ensure 2 decimal places
  },
  currency: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  transactionHash: {
    type: String,
    required: true
  },
  planId: {
    type: String,
    required: true
  },
  walletAddress: {
    type: String,
    required: function() {
      return this.type === 'withdrawal';
    },
    trim: true
  }
}, {
  timestamps: true
});

// Add validation middleware
transactionSchema.pre('save', function(next) {
  if (this.amount <= 0) {
    next(new Error('Amount must be greater than 0'));
  }
  next();
});

export default mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema); 