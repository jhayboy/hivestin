/**
 * Get client IP address from request
 */
export function getClientIp(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0] || 
         request.headers.get('x-real-ip') || 
         request.socket?.remoteAddress ||
         '127.0.0.1';
}

/**
 * Get user agent from request
 */
export function getUserAgent(request) {
  return request.headers.get('user-agent') || 'Unknown';
}

/**
 * Get location info from IP address
 */
export async function getLocationFromIP(ip) {
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();
    return `${data.city}, ${data.country_name}`;
  } catch (error) {
    console.error('IP location lookup failed:', error);
    return 'Unknown Location';
  }
}

/**
 * Format currency amount
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

/**
 * Format date to local string
 */
export function formatDate(date) {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate random string
 */
export function generateRandomString(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
}

/**
 * Sleep/delay function
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
} 