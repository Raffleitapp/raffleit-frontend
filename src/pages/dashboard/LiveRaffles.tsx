import { useState, useEffect } from 'react';

// Define a type for a single live raffle
interface LiveRaffle {
  id: string;
  title: string;
  prize: string;
  currentTickets: number;
  totalTickets: number;
  endDate: string; // YYYY-MM-DD format for easy date comparison
  ticketPrice: number;
  imageUrl: string;
  category: string;
}

const LiveRaffles = () => {
  const [liveRaffles, setLiveRaffles] = useState<LiveRaffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLiveRaffles = async () => {
      setLoading(true);
      setError(null);

      // Simulate API call
      try {
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay

        // Mock data for live raffles
        const mockLiveRaffles: LiveRaffle[] = [
          {
            id: 'lr-001',
            title: 'Dream Car Giveaway',
            prize: 'Brand New Luxury Sedan',
            currentTickets: 1500,
            totalTickets: 5000,
            endDate: '2025-06-15',
            ticketPrice: 25.00,
            imageUrl: 'https://via.placeholder.com/400x250/3498db/ffffff?text=Luxury+Car',
            category: 'Vehicles',
          },
          {
            id: 'lr-002',
            title: 'Latest Gadget Bundle',
            prize: 'High-End Laptop, Tablet & Smartwatch',
            currentTickets: 320,
            totalTickets: 1000,
            endDate: '2025-05-30',
            ticketPrice: 10.00,
            imageUrl: 'https://via.placeholder.com/400x250/2ecc71/ffffff?text=Gadget+Bundle',
            category: 'Electronics',
          },
          {
            id: 'lr-003',
            title: 'Exotic Holiday Package',
            prize: '10-Day Trip to Maldives for Two',
            currentTickets: 80,
            totalTickets: 300,
            endDate: '2025-07-01',
            ticketPrice: 50.00,
            imageUrl: 'https://via.placeholder.com/400x250/9b59b6/ffffff?text=Maldives+Trip',
            category: 'Travel',
          },
          {
            id: 'lr-004',
            title: 'Next-Gen Gaming Console',
            prize: 'PS5 Pro with 3 Games',
            currentTickets: 600,
            totalTickets: 1500,
            endDate: '2025-06-20',
            ticketPrice: 12.50,
            imageUrl: 'https://via.placeholder.com/400x250/e74c3c/ffffff?text=Gaming+Console',
            category: 'Electronics',
          },
        ];
        setLiveRaffles(mockLiveRaffles);
      } catch (err) {
        console.error("Failed to fetch live raffles:", err);
        setError("Failed to load live raffles. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLiveRaffles();
  }, []); // Empty dependency array means this runs once on mount

  const calculateDaysLeft = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="loader"></div> Loading Live Raffles...
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
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900">Live Raffles</h1>
      <p className="text-lg text-gray-700 mb-8">
        Check out the raffles currently running and grab your tickets!
      </p>

      {liveRaffles.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-600">No live raffles available at the moment.</p>
          <button
            onClick={() => alert('Maybe suggest checking back later or exploring past raffles.')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh List
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveRaffles.map((raffle) => {
            const daysLeft = calculateDaysLeft(raffle.endDate);
            const progress = (raffle.currentTickets / raffle.totalTickets) * 100;

            return (
              <div key={raffle.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-200 hover:scale-[1.02]">
                <img src={raffle.imageUrl} alt={raffle.title} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{raffle.title}</h2>
                  <p className="text-lg text-blue-700 mb-4 font-semibold">{raffle.prize}</p>

                  <div className="mb-4">
                    <p className="text-gray-700 text-sm">Tickets: <span className="font-semibold">{raffle.currentTickets}</span> / {raffle.totalTickets}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-gray-700 text-sm mt-2">Ticket Price: <span className="font-semibold">${raffle.ticketPrice.toFixed(2)}</span></p>
                    <p className="text-gray-700 text-sm mt-2">
                        Draws in: <span className="font-bold text-red-600">
                          {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                        </span>
                    </p>
                  </div>

                  <button
                    onClick={() => alert(`Entering raffle: ${raffle.title}`)} // Replace with actual navigation/modal
                    className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors"
                  >
                    Enter Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LiveRaffles;