'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      toast.error('Invalid verification link');
      router.push('/login');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email/${token}`);
        
        if (response.ok) {
          toast.success('Email verified successfully! You can now login.');
          router.push('/login?verified=true');
        } else {
          const data = await response.json();
          toast.error(data.message || 'Verification failed');
          router.push('/login');
        }
      } catch (error) {
        console.error('Verification error:', error);
        toast.error('Failed to verify email');
        router.push('/login');
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Email Verification</h2>
        {verifying ? (
          <p className="text-gray-300">Verifying your email address...</p>
        ) : (
          <p className="text-gray-300">Redirecting to login page...</p>
        )}
      </div>
    </div>
  );
} 