'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching user profile data...');
        const response = await fetch('/api/user/profile');
        const data = await response.json();

        if (response.ok) {
          console.log('User data received:', data);
          setUserData(data);
        } else {
          throw new Error(data.message || 'Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!userData) {
    return <div>No user data found</div>;
  }

  return (
    <div className="p-6 bg-gray-900">
      <div className="max-w-xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-6">Profile Information</h2>
          
          {/* Email Section */}
          <div className="mb-6 pb-6 border-b border-gray-700">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Email Address
            </label>
            <p className="text-white font-medium">{userData.email}</p>
          </div>

          {/* User ID Section */}
          <div className="mb-6 pb-6 border-b border-gray-700">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              User ID
            </label>
            <p className="text-white font-mono bg-gray-700 p-2 rounded">{userData.id}</p>
          </div>

          {/* Investment Status Section */}
          <div className="mb-6 pb-6 border-b border-gray-700">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Investment Status
            </label>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${userData.hasDeposited ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <p className="text-white">{userData.hasDeposited ? "Active Investment" : "No Active Investment"}</p>
            </div>
            {userData.hasDeposited && (
              <div className="mt-2">
                <p className="text-gray-400 text-sm">Balance: ${userData.balance?.toFixed(2)}</p>
                <p className="text-gray-400 text-sm">Profit: ${userData.profit?.toFixed(2)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 