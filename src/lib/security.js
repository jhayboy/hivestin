import User from '@/models/User';
import { sendEmail } from '@/lib/mail';

export async function getBlockedIps() {
  const blockedIps = await User.distinct('security.blockedIPs');
  return blockedIps.filter(Boolean); // Remove null/undefined values
}

export async function handleFailedLogin(user, ip) {
  user.security.failedLoginAttempts += 1;
  user.security.lastFailedLogin = new Date();
  
  if (user.security.failedLoginAttempts >= 5) {
    user.security.blockedIPs.push(ip);
    await sendEmail({
      to: user.email,
      template: 'ACCOUNT_LOCKED',
      data: {
        time: new Date().toLocaleString(),
        ip: ip
      }
    });
  }
  
  await user.save();
}

export async function handleAccountLock(user) {
  user.security.twoFactorEnabled = true; // Force 2FA after account lock
  await sendEmail({
    to: user.email,
    template: 'SECURITY_ALERT',
    data: {
      message: 'Your account has been locked due to multiple failed login attempts'
    }
  });
  await user.save();
}

export function getClientIp(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0] || 
         request.headers.get('x-real-ip') || 
         '127.0.0.1';
}

export function getUserAgent(request) {
  return request.headers.get('user-agent') || 'Unknown';
}

export async function getLocationFromIP(ip) {
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();
    return `${data.city}, ${data.country_name}`;
  } catch (error) {
    return 'Unknown Location';
  }
} 