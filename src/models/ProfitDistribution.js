import mongoose from 'mongoose';

const profitDistributionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['investment'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'failed'],
    default: 'pending'
  },
  processedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ProfitDistribution = mongoose.models.ProfitDistribution || 
  mongoose.model('ProfitDistribution', profitDistributionSchema);

export default ProfitDistribution; 