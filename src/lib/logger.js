import ActivityLog from '@/models/ActivityLog';
import { getClientIp, getUserAgent } from '@/lib/utils';

export async function logActivity(userId, action, details, request) {
  try {
    await ActivityLog.create({
      userId,
      action,
      details,
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request)
    });
  } catch (error) {
    console.error('Activity logging error:', error);
  }
} 