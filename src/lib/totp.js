import { authenticator } from 'otplib';
import qrcode from 'qrcode';

export function generateSecret() {
  return authenticator.generateSecret();
}

export async function generateTOTP(secret) {
  const token = authenticator.generate(secret);
  const otpauth = authenticator.keyuri('user', 'CryptoInvestment', secret);
  
  return {
    token,
    qrCode: await qrcode.toDataURL(otpauth)
  };
}

export function verifyTOTP(secret, token) {
  return authenticator.verify({ token, secret });
} 