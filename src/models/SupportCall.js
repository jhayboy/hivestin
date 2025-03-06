import mongoose from 'mongoose';

const supportCallSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
    required: true,
    enum: ['investment', 'withdrawal', 'deposit', 'technical', 'other'],
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled',
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Compound index to ensure unique date-time combination
supportCallSchema.index({ date: 1, time: 1 }, { unique: true });

// Compound index to ensure one booking per user per day
supportCallSchema.index({ userId: 1, date: 1, status: 1 });

const SupportCall = mongoose.models.SupportCall || mongoose.model('SupportCall', supportCallSchema);
export default SupportCall; 