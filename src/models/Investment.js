import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  planId: {
    type: String,
    required: true,
  },
  planName: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  returnRate: {
    type: Number,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  nextPayoutDate: {
    type: Date,
    required: true,
  },
  totalProfit: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed'],
    default: 'pending',
  },
  payoutHistory: [{
    amount: Number,
    date: Date,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    }
  }],
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true
});

// Add error handling for required fields
investmentSchema.pre('save', function(next) {
  if (!this.nextPayoutDate) {
    this.nextPayoutDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  }
  next();
});

const Investment = mongoose.models.Investment || mongoose.model('Investment', investmentSchema);
export default Investment;