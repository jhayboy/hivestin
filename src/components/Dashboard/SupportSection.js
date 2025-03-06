'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function SupportSection() {
  const [tickets, setTickets] = useState([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply] = useState('');
  const [category, setCategory] = useState('general');
  const [hasActiveInvestment, setHasActiveInvestment] = useState(false);

  useEffect(() => {
    fetchTickets();
    checkActiveInvestment();
  }, []);

  const checkActiveInvestment = async () => {
    try {
      const response = await fetch('/api/investments/active');
      const data = await response.json();
      setHasActiveInvestment(data.hasActiveInvestment);
    } catch (error) {
      console.error('Error checking investment status:', error);
    }
  };

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/support/tickets');
      const data = await response.json();
      if (response.ok) {
        setTickets(data);
      }
    } catch (error) {
      toast.error('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subject,
          message,
          category 
        }),
      });

      if (response.ok) {
        toast.success('Support ticket created successfully');
        setSubject('');
        setMessage('');
        fetchTickets();
      } else {
        throw new Error('Failed to create ticket');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    try {
      const response = await fetch(`/api/support/tickets/${selectedTicket._id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: reply }),
      });

      if (response.ok) {
        toast.success('Reply sent successfully');
        setReply('');
        fetchTickets();
      } else {
        throw new Error('Failed to send reply');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Investment Indicator */}
      {hasActiveInvestment && (
        <div className="bg-green-900 border border-green-700 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            <p className="text-green-100">
              You have an active investment plan. Our support team will prioritize your inquiries.
            </p>
          </div>
        </div>
      )}

      {/* Create Ticket Form */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Create Support Ticket</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
              required
            >
              <option value="general">General Inquiry</option>
              <option value="deposit">Deposit Issue</option>
              <option value="withdrawal">Withdrawal Issue</option>
              <option value="technical">Technical Issue</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
              placeholder="Brief description of your issue"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white h-32"
              placeholder="Describe your issue in detail..."
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Submit
          </button>
        </form>
      </div>

      {/* Tickets List */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Your Tickets</h2>
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className="bg-gray-700 p-4 rounded-lg cursor-pointer"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-white font-medium">{ticket.subject}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      ticket.status === 'open' ? 'bg-green-900 text-green-200' :
                      ticket.status === 'in-progress' ? 'bg-yellow-900 text-yellow-200' :
                      'bg-gray-600 text-gray-200'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mt-2">{ticket.message}</p>
                  <div className="mt-2 text-gray-400 text-xs">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Ticket Messages */}
        {selectedTicket && (
          <div className="mt-6 border-t border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-white mb-4">
              Ticket: {selectedTicket.subject}
            </h3>
            <div className="space-y-4 mb-4">
              {selectedTicket.messages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    msg.sender === selectedTicket.userId
                      ? 'bg-blue-900 ml-8'
                      : 'bg-gray-700 mr-8'
                  }`}
                >
                  <p className="text-white">{msg.content}</p>
                  <div className="text-gray-400 text-xs mt-1">
                    {new Date(msg.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleReply} className="flex gap-2">
              <input
                type="text"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded text-white"
                placeholder="Type your reply..."
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
} 