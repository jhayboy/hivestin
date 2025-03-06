import mongoose from 'mongoose';
import { isAdmin } from '@/lib/auth';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  profit: {
    type: Number,
    default: 0,
    min: 0
  },
  totalPayout: {
    type: Number,
    default: 0,
    min: 0
  },
  referralCode: {
    type: String,
    default: null,
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  hasDeposited: {
    type: Boolean,
    default: false,
  },
  depositDeadline: {
    type: Date,
    default: () => new Date(+new Date() + 48 * 60 * 60 * 1000), // 48 hours from creation
  },
  isAdmin: {
    type: Boolean,
    default: function() {
      return isAdmin(this.email);
    }
  }
});

// No password hashing middleware here

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User; 