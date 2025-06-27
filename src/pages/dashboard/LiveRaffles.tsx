import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../constants/constants';
import { useAuth } from '../../context/authUtils';

// Define a type for a single live raffle
interface LiveRaffle {
  id: number;
  title: string;
  prize: string;
  description?: string;
  hostName: string;
  currentTickets: number;
  totalTickets: number;
  endDate: string; // YYYY-MM-DD format for easy date comparison
  ticketPrice: number;
  imageUrl: string;
  category: string;
  target: number;
  images?: Array<{
    id: number;
    path: string;
    url: string;
  }>;
}

const LiveRaffles = () => {
  const { user } = useAuth();
  const [liveRaffles, setLiveRaffles] = useState<LiveRaffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRaffle, setSelectedRaffle] = useState<LiveRaffle | null>(null);
  const [showRaffleModal, setShowRaffleModal] = useState(false);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchLiveRaffles = async () => {
      setLoading(true);
      setError(null);

      try {
        // Define a type for the API response if it differs from LiveRaffle
        interface RaffleApiResponse {
          id: number;
          title?: string;
          host_name?: string;
          prize?: string;
          description?: string;
          target?: number;
          tickets_sold?: number;
          total_tickets?: number;
          ending_date: string;
          ticket_price?: number;
          image1?: string;
          image1_url?: string;
          images?: Array<{
            id: number;
            path: string;
            url: string;
          }>;
          category?: { category_name?: string };
          approve_status?: string;
        }

        // Fetch all raffles, then filter for live ones (you can adjust API to support status filter)
        const res = await fetch(`${API_BASE_URL}/raffles`);
        if (!res.ok) throw new Error('Failed to fetch raffles');
        const data: RaffleApiResponse[] = await res.json();

        // Filter for live raffles (assuming status or endDate logic)
        const now = new Date();
        const live = data.filter((raffle: RaffleApiResponse) => {
          // Example: raffle.approve_status === 'approved' && new Date(raffle.ending_date) > now
          return new Date(raffle.ending_date) > now && raffle.approve_status === 'approved';
        }).map((raffle: RaffleApiResponse) => ({
          id: raffle.id,
          title: raffle.title || raffle.host_name || 'Untitled Raffle',
          prize: raffle.prize || raffle.description || 'No prize specified',
          description: raffle.description || '',
          hostName: raffle.host_name || 'Unknown Host',
          target: raffle.target || 0,
          currentTickets: raffle.tickets_sold ?? 0,
          totalTickets: raffle.total_tickets ?? 0,
          endDate: raffle.ending_date,
          ticketPrice: raffle.ticket_price ?? 0,
          imageUrl: raffle.image1_url || 
                   (raffle.images && raffle.images.length > 0 ? raffle.images[0].url : null) ||
                   '/images/default-raffle.png',
          category: raffle.category?.category_name || 'N/A',
          images: raffle.images || [],
        }));

        setLiveRaffles(live);
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

  const openRaffleModal = (raffle: LiveRaffle) => {
    setSelectedRaffle(raffle);
    setShowRaffleModal(true);
    setTicketQuantity(1);
    setPurchaseError(null);
    setPurchaseSuccess(null);
  };

  const closeRaffleModal = () => {
    setShowRaffleModal(false);
    setSelectedRaffle(null);
    setTicketQuantity(1);
    setPurchaseError(null);
    setPurchaseSuccess(null);
  };

  const handlePurchaseTickets = async () => {
    if (!selectedRaffle || !user) {
      setPurchaseError('Please log in to purchase tickets');
      return;
    }

    setPurchasing(true);
    setPurchaseError(null);
    setPurchaseSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          raffle_id: selectedRaffle.id,
          quantity: ticketQuantity,
          user_id: user.user_id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to purchase tickets');
      }

      const result = await response.json();
      setPurchaseSuccess(`Successfully purchased ${ticketQuantity} ticket(s)! Your ticket numbers: ${result.ticket_numbers?.join(', ') || 'N/A'}`);
      
      // Refresh the raffles to show updated ticket counts
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (err) {
      setPurchaseError(err instanceof Error ? err.message : 'Failed to purchase tickets');
    } finally {
      setPurchasing(false);
    }
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
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveRaffles.map((raffle) => {
            const daysLeft = calculateDaysLeft(raffle.endDate);
            const progress = raffle.totalTickets
              ? (raffle.currentTickets / raffle.totalTickets) * 100
              : 0;

            return (
              <div key={raffle.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-200 hover:scale-[1.02]">
                <div className="relative">
                  <img 
                    src={raffle.imageUrl} 
                    alt={raffle.title} 
                    className="w-full h-48 object-cover" 
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/default-raffle.png';
                    }}
                  />
                  {/* Additional Images Indicator */}
                  {raffle.images && raffle.images.length > 1 && (
                    <div className="absolute bottom-2 left-2">
                      <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                        📷 {raffle.images.length} photos
                      </span>
                    </div>
                  )}
                  {/* Category Badge */}
                  <div className="absolute top-2 right-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                      {raffle.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{raffle.title}</h2>
                  <p className="text-lg text-blue-700 mb-4 font-semibold">{raffle.prize}</p>

                  <div className="mb-4">
                    <p className="text-gray-700 text-sm">Tickets: <span className="font-semibold">{raffle.currentTickets}</span> / {raffle.totalTickets}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-gray-700 text-sm mt-2">Ticket Price: <span className="font-semibold">${raffle.ticketPrice?.toFixed(2) ?? 'N/A'}</span></p>
                    <p className="text-gray-700 text-sm mt-2">
                      Draws in: <span className="font-bold text-red-600">
                        {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={() => openRaffleModal(raffle)}
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

      {/* Raffle Details and Purchase Modal */}
      {showRaffleModal && selectedRaffle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="relative">
              <img 
                src={selectedRaffle.imageUrl} 
                alt={selectedRaffle.title}
                className="w-full h-64 object-cover rounded-t-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/default-raffle.png';
                }}
              />
              <button
                onClick={closeRaffleModal}
                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75 text-xl"
              >
                ✕
              </button>
              {/* Additional Images Indicator */}
              {selectedRaffle.images && selectedRaffle.images.length > 1 && (
                <div className="absolute bottom-4 left-4">
                  <span className="bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm">
                    📷 {selectedRaffle.images.length} photos
                  </span>
                </div>
              )}
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedRaffle.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-semibold">
                    {selectedRaffle.category}
                  </span>
                  <span>Host: {selectedRaffle.hostName}</span>
                </div>
              </div>

              {/* Prize Information */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Prize</h2>
                <p className="text-lg text-blue-700 font-semibold">{selectedRaffle.prize}</p>
              </div>

              {/* Description */}
              {selectedRaffle.description && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Description</h2>
                  <p className="text-gray-700 leading-relaxed">{selectedRaffle.description}</p>
                </div>
              )}

              {/* Raffle Statistics */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-600 mb-1">Target Amount</h3>
                  <p className="text-xl font-bold text-green-600">${selectedRaffle.target.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-600 mb-1">Ticket Price</h3>
                  <p className="text-xl font-bold text-blue-600">${selectedRaffle.ticketPrice.toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-600 mb-1">Tickets Sold</h3>
                  <p className="text-xl font-bold text-gray-900">
                    {selectedRaffle.currentTickets} / {selectedRaffle.totalTickets}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${selectedRaffle.totalTickets ? (selectedRaffle.currentTickets / selectedRaffle.totalTickets) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-600 mb-1">Draw Date</h3>
                  <p className="text-xl font-bold text-red-600">
                    {calculateDaysLeft(selectedRaffle.endDate)} day{calculateDaysLeft(selectedRaffle.endDate) !== 1 ? 's' : ''} left
                  </p>
                  <p className="text-sm text-gray-600">{new Date(selectedRaffle.endDate).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Purchase Section */}
              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Purchase Tickets</h2>
                
                {purchaseSuccess && (
                  <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                    {purchaseSuccess}
                  </div>
                )}

                {purchaseError && (
                  <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {purchaseError}
                  </div>
                )}

                {!user ? (
                  <div className="text-center p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
                    <p className="mb-2">Please log in to purchase tickets</p>
                    <button
                      onClick={() => window.location.href = '/login'}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Log In
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                        Number of tickets:
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                          className="w-8 h-8 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors flex items-center justify-center"
                          disabled={purchasing}
                        >
                          -
                        </button>
                        <input
                          id="quantity"
                          type="number"
                          min="1"
                          max="10"
                          value={ticketQuantity}
                          onChange={(e) => setTicketQuantity(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                          className="w-16 text-center border border-gray-300 rounded px-2 py-1"
                          disabled={purchasing}
                        />
                        <button
                          onClick={() => setTicketQuantity(Math.min(10, ticketQuantity + 1))}
                          className="w-8 h-8 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors flex items-center justify-center"
                          disabled={purchasing}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-lg font-semibold">Total Cost:</span>
                      <span className="text-2xl font-bold text-green-600">
                        ${(selectedRaffle.ticketPrice * ticketQuantity).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={closeRaffleModal}
                        className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                        disabled={purchasing}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handlePurchaseTickets}
                        disabled={purchasing}
                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {purchasing ? 'Processing...' : `Purchase ${ticketQuantity} Ticket${ticketQuantity > 1 ? 's' : ''}`}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveRaffles;