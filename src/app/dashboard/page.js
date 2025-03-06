'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  HomeIcon,
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  ClockIcon,
  CalendarIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import DepositSection from '@/components/Dashboard/DepositSection';
import WithdrawSection from '@/components/Dashboard/WithdrawSection';
import TransactionHistory from '@/components/Dashboard/TransactionHistory';
import SupportScheduler from '@/components/Dashboard/SupportScheduler';
import Profile from '@/components/Dashboard/Profile';
import SupportSection from '@/components/Dashboard/SupportSection';

export default function Dashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        
        if (!data.authenticated) {
          toast.error('Please login to access dashboard');
          router.push('/login');
          return;
        }
        
        fetchUserData();
      } catch (error) {
        console.error('Auth check error:', error);
        toast.error('Authentication failed');
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/profile');
      const data = await response.json();
      
      if (response.ok) {
        setUserData(data);
      } else {
        console.error('Failed to fetch user data:', data.message);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      });

      if (response.ok) {
        toast.success('Logged out successfully');
        router.push('/login');
      } else {
        toast.error('Failed to logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const menuItems = [
    { id: 'overview', name: 'Overview', icon: HomeIcon },
    { id: 'deposit', name: 'Deposit', icon: ArrowDownCircleIcon },
    { id: 'withdraw', name: 'Withdraw', icon: ArrowUpCircleIcon },
    { id: 'history', name: 'History', icon: ClockIcon },
    { id: 'support', name: 'Support', icon: ChatBubbleLeftRightIcon, component: <SupportSection /> },
    { id: 'profile', name: 'Profile', icon: UserCircleIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'deposit':
        return <DepositSection />;
      case 'withdraw':
        return <WithdrawSection balance={userData?.balance} />;
      case 'history':
        return <TransactionHistory />;
      case 'support':
        return <SupportScheduler />;
      case 'profile':
        console.log('Rendering profile with userData:', userData);
        return <Profile userData={userData} onUpdate={fetchUserData} />;
      default:
        return null;
    }
  };

  const renderOverview = () => {
    if (loading) {
      return <div>Loading...</div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Account Balance Card */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-gray-400 text-sm font-medium">Account Balance</h3>
          <p className="text-2xl font-bold text-white mt-2">
            ${userData?.balance?.toFixed(2).toLocaleString('en-US') || '0.00'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Active Investment
          </p>
        </div>

        {/* Total Profit Card */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-gray-400 text-sm font-medium">Total Profit</h3>
          <p className="text-2xl font-bold text-green-400 mt-2">
            ${userData?.profit?.toFixed(2) || '0.00'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Accumulated Earnings
          </p>
        </div>

        {/* Total Withdrawals Card */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-gray-400 text-sm font-medium">Total Withdrawals</h3>
          <p className="text-2xl font-bold text-blue-400 mt-2">
            ${userData?.totalPayout?.toFixed(2) || '0.00'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Processed Payouts
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md bg-gray-800 text-white hover:bg-gray-700"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar - Mobile */}
        <div
          className={`lg:hidden fixed inset-y-0 left-0 z-40 w-64 transform ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } transition-transform duration-300 ease-in-out`}
        >
          <div className="h-full bg-gray-800 flex flex-col">
            <div className="flex items-center justify-between p-4">
              <h2 className="text-xl font-bold text-white">Dashboard</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 space-y-2 p-4">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              ))}
            </nav>
            {/* Logout Button - Mobile */}
            <div className="p-4 border-t border-gray-700">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Backdrop - only affects mobile menu */}
        {isMobileMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-gray-900 bg-opacity-50 z-30"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar - Desktop */}
        <div className="hidden lg:block w-64 bg-gray-800 min-h-screen p-4">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white">Dashboard</h2>
          </div>
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </button>
            ))}
          </nav>
          {/* Logout Button - Desktop */}
          <div className="mt-auto pt-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-8 mt-16 lg:mt-0">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">
              {menuItems.find(item => item.id === activeTab)?.name}
            </h1>
          </div>
          <div className="w-full overflow-x-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
} 