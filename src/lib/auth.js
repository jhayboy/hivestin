import * as jose from 'jose';

const ADMIN_EMAILS = [
  'mbamarajustice1@gmail.com',
  'megaonline247@gmail.com',
];

export function isAdmin(email) {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

// Create a more robust secret key handling
const getSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
  return new TextEncoder().encode(secret);
};

export async function generateToken(user) {
  try {
    const secret = await getSecretKey();
    
    const token = await new jose.SignJWT({ 
      userId: user._id.toString(),
      email: user.email,
      isAdmin: user.isAdmin 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);
    
    return token;
  } catch (error) {
    console.error('Token generation error:', error);
    throw new Error('Failed to generate authentication token');
  }
}

export async function verifyToken(token) {
  try {
    const secret = await getSecretKey();
    const { payload } = await jose.jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.error('Token verification error:', error);
    throw new Error('Invalid token');
  }
}

export function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
} 