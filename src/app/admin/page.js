'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UserManagement from '@/components/Admin/UserManagement';
import TransactionApproval from '@/components/Admin/TransactionApproval';
import SupportCallManagement from '@/components/Admin/SupportCallManagement';
import SystemStats from '@/components/Admin/SystemStats';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    // Check if user is admin
    const checkAdmin = async () => {
      try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        console.log('Auth check response:', data); // Debug log
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };

    checkAdmin();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement />;
      case 'transactions':
        return <TransactionApproval />;
      case 'support':
        return <SupportCallManagement />;
      case 'stats':
        return <SystemStats />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h1>
        
        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-700">
          <nav className="-mb-px flex space-x-6">
            {['users', 'transactions', 'support', 'stats'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="bg-gray-800 shadow rounded-lg p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
} 