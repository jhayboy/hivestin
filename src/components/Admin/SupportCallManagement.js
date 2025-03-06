'use client';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function SupportCallManagement() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    try {
      const response = await fetch('/api/admin/support-calls');
      const data = await response.json();
      if (response.ok) {
        setCalls(data);
      }
    } catch (error) {
      console.error('Error fetching support calls:', error);
      toast.error('Failed to load support calls');
    } finally {
      setLoading(false);
    }
  };

  const handleCallAction = async (callId, action) => {
    try {
      const response = await fetch(`/api/admin/support-calls/${callId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        toast.success(`Call ${action}ed successfully`);
        fetchCalls();
      } else {
        toast.error(`Failed to ${action} call`);
      }
    } catch (error) {
      console.error(`Error ${action}ing call:`, error);
      toast.error(`Failed to ${action} call`);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Support Call Management</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Topic
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {calls.map((call) => (
              <tr key={call._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {call.user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(call.date), 'MMM d, yyyy')} at {call.time}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                  {call.topic}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    call.status === 'scheduled'
                      ? 'bg-yellow-100 text-yellow-800'
                      : call.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {call.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {call.status === 'scheduled' && (
                    <div className="space-x-4">
                      <button
                        onClick={() => handleCallAction(call._id, 'accept')}
                        className="text-green-600 hover:text-green-900"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleCallAction(call._id, 'decline')}
                        className="text-red-600 hover:text-red-900"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 