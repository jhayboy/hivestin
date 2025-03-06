'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function SupportTicketManagement() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/admin/support/tickets');
      const data = await response.json();
      if (response.ok) {
        setTickets(data);
      }
    } catch (error) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    try {
      const response = await fetch(`/api/admin/support/tickets/${selectedTicket._id}/reply`, {
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

  const updateTicketStatus = async (ticketId, status) => {
    try {
      const response = await fetch(`/api/admin/support/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast.success('Ticket status updated');
        fetchTickets();
      } else {
        throw new Error('Failed to update ticket status');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-xl font-semibold text-white mb-6">Support Tickets</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets List */}
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div
              key={ticket._id}
              className={`bg-gray-700 p-4 rounded-lg cursor-pointer ${
                selectedTicket?._id === ticket._id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedTicket(ticket)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-white font-medium">{ticket.subject}</h3>
                  <p className="text-gray-400 text-sm">
                    {ticket.user?.email}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={ticket.status}
                    onChange={(e) => updateTicketStatus(ticket._id, e.target.value)}
                    className="bg-gray-600 text-white text-sm rounded px-2 py-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
              <p className="text-gray-300 text-sm mt-2">{ticket.message}</p>
              <div className="mt-2 text-gray-400 text-xs">
                {new Date(ticket.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>

        {/* Selected Ticket Messages */}
        {selectedTicket && (
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-4">
              Ticket: {selectedTicket.subject}
            </h3>
            <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
              {selectedTicket.messages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    msg.sender === selectedTicket.userId
                      ? 'bg-gray-600 mr-8'
                      : 'bg-blue-900 ml-8'
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
                className="flex-1 p-2 bg-gray-600 border border-gray-500 rounded text-white"
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