import { useState, useEffect } from 'react';
import { useAuth } from '../../context/authUtils';
import { API_BASE_URL } from '../../constants/constants';

// Define a type for a single ticket
interface Ticket {
  id: number;
  raffleTitle: string;
  ticketNumber: string;
  drawDate: string;
  status: 'pending' | 'won' | 'lost';
  prize?: string;
}

const Tickets = () => {
  const { user, isAuthenticated } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!isAuthenticated || !user) {
        setLoading(false);
        setError("Please log in to view your tickets.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/users/${user.user_id}/tickets`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!res.ok) throw new Error('Failed to fetch tickets');
        const data = await res.json();

        // Map backend ticket fields to frontend Ticket type
        interface BackendTicket {
          id: number;
          ticket_number: string;
          status?: 'pending' | 'won' | 'lost';
          prize?: string;
          raffle?: {
            title?: string;
            host_name?: string;
            ending_date?: string;
          };
        }

        const mappedTickets: Ticket[] = (data as BackendTicket[]).map((t) => ({
          id: t.id,
          raffleTitle: t.raffle?.title || t.raffle?.host_name || 'Raffle',
          ticketNumber: t.ticket_number,
          drawDate: t.raffle?.ending_date ? new Date(t.raffle.ending_date).toISOString().slice(0, 10) : '',
          status: t.status || 'pending',
          prize: t.prize || undefined,
        }));

        setTickets(mappedTickets);
      } catch (err) {
        console.error("Failed to fetch tickets:", err);
        setError("Failed to load tickets. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [isAuthenticated, user]); // Re-fetch if auth status or user changes

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="loader"></div> Loading Tickets...
        <style>{`
                  .loader {
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #3498db;
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    animation: spin 1s linear infinite;
                    display: inline-block;
                    margin-left: 10px;
                  }

                  @keyframes spin {
                    0% {
                      transform: rotate(0deg);
                    }
                    100% {
                      transform: rotate(360deg);
                    }
                  }
                `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen text-red-700 text-center text-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900">My Tickets</h1>
      <p className="text-lg text-gray-700 mb-8">View all the raffle tickets you've purchased.</p>

      {tickets.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-600">You haven't purchased any tickets yet.</p>
          <button
            onClick={() => alert('Navigate to Raffles page')} // Replace with actual navigation
            className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
          >
            Explore Raffles
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-lg shadow-md overflow-hidden p-6 relative">
              {ticket.status === 'won' && (
                <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">WON!</span>
              )}
              {ticket.status === 'lost' && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">LOST</span>
              )}
              <h2 className="text-xl font-bold text-gray-900 mb-2">{ticket.raffleTitle}</h2>
              <p className="text-sm text-gray-600 mb-4">Ticket Number: <span className="font-semibold text-blue-700">{ticket.ticketNumber}</span></p>

              <div className="mb-4">
                <p className="text-gray-700 text-sm">Draw Date: <span className="font-semibold">{ticket.drawDate}</span></p>
                <p className="text-gray-700 text-sm">Status: <span className={`font-semibold ${
                  ticket.status === 'pending' ? 'text-yellow-600' :
                  ticket.status === 'won' ? 'text-green-600' :
                  'text-red-600'
                }`}>{ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}</span></p>
                {ticket.prize && (
                  <p className="text-gray-700 text-sm mt-2">Prize: <span className="font-bold text-purple-700">{ticket.prize}</span></p>
                )}
              </div>

              {/* You could add a button to view raffle details here */}
              <button className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
                View Raffle Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tickets;