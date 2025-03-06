'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function SupportScheduler() {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [topic, setTopic] = useState('investment');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const AVAILABLE_TIMES = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/support/schedule-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          time: selectedTime,
          topic
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Call scheduled successfully! Check your email 5 minutes before the call.');
        setSelectedDate('');
        setSelectedTime('');
        setTopic('investment');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to schedule call');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold text-white mb-4">Schedule Support Call</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full bg-gray-700 text-white rounded p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Time
          </label>
          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-full bg-gray-700 text-white rounded p-2"
            required
          >
            <option value="">Select a time</option>
            {AVAILABLE_TIMES.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Topic
          </label>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-gray-700 text-white rounded p-2"
            required
          >
            <option value="investment">Investment</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="deposit">Deposit</option>
            <option value="technical">Technical Issue</option>
            <option value="other">Other</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-800"
        >
          {isSubmitting ? 'Scheduling...' : 'Schedule Call'}
        </button>
      </form>
    </div>
  );
} 