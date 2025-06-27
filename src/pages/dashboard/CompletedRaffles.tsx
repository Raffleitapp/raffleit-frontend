import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../constants/constants';

interface CompletedRaffle {
  id: number;
  title: string;
  prize: string;
  winner: string;
  totalTickets: number;
  ticketsSold: number;
  drawDate: string;
  imageUrl: string;
  images?: Array<{
    id: number;
    path: string;
    url: string;
  }>;
}

const CompletedRaffles = () => {
  const [completedRaffles, setCompletedRaffles] = useState<CompletedRaffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompletedRaffles = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all raffles, then filter for completed ones
        const res = await fetch(`${API_BASE_URL}/raffles`);
        if (!res.ok) throw new Error('Failed to fetch raffles');
        const data = await res.json();
        const now = new Date();
        // Filter for completed raffles (ending_date in the past and approved)
        interface ApiRaffle {
          id: number;
          title?: string;
          host_name?: string;
          prize?: string;
          description?: string;
          winner_name?: string;
          total_tickets?: number;
          tickets_sold?: number;
          ending_date: string;
          approve_status: string;
          image1?: string;
          image1_url?: string;
          images?: Array<{
            id: number;
            path: string;
            url: string;
          }>;
        }

        const completed = (data as ApiRaffle[]).filter((raffle) => {
          return new Date(raffle.ending_date) <= now && raffle.approve_status === 'approved';
        }).map((raffle) => ({
          id: raffle.id,
          title: raffle.title || raffle.host_name || 'Untitled Raffle',
          prize: raffle.prize || raffle.description || 'No prize specified',
          winner: raffle.winner_name || 'TBA',
          totalTickets: raffle.total_tickets ?? 0,
          ticketsSold: raffle.tickets_sold ?? 0,
          drawDate: raffle.ending_date,
          imageUrl: raffle.image1 || '/images/default.png',
        }));
        setCompletedRaffles(completed);
      } catch {
        setError('Failed to load completed raffles.');
      } finally {
        setLoading(false);
      }
    };
    fetchCompletedRaffles();
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="loader"></div> Loading Completed Raffles...
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
            0% { transform: rotate(0deg);}
            100% { transform: rotate(360deg);}
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
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900">Completed Raffles</h1>
      <p className="text-lg text-gray-700 mb-8">Review all raffles that have concluded and their winners.</p>
      {completedRaffles.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-600">No completed raffles to display yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {completedRaffles.map((raffle) => (
            <div key={raffle.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-200 hover:scale-[1.02]">
              <img src={raffle.imageUrl} alt={raffle.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{raffle.title}</h2>
                <p className="text-lg text-blue-700 mb-4 font-semibold">{raffle.prize}</p>
                <div className="mb-4">
                  <p className="text-gray-700 text-sm"><strong>Winner:</strong> <span className="font-semibold text-green-600">{raffle.winner}</span></p>
                  <p className="text-gray-700 text-sm"><strong>Draw Date:</strong> {raffle.drawDate}</p>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Tickets Sold: <span className="font-semibold">{raffle.ticketsSold}</span> / {raffle.totalTickets}</span>
                  {raffle.ticketsSold === raffle.totalTickets && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">SOLD OUT</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompletedRaffles;