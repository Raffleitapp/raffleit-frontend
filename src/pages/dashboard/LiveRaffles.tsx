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
  type: 'raffle' | 'fundraising';
  currentAmount: number; // Total money collected (tickets + donations)
  ticketRevenue: number; // Money from ticket sales only
  donationAmount: number; // Money from donations only
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
  const [donationAmount, setDonationAmount] = useState<string>('');
  const [donationMode, setDonationMode] = useState(false); // Toggle between ticket purchase and donation
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
          ticket_price?: number | string;
          type: 'raffle' | 'fundraising';
          current_amount?: number;
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
        }).map((raffle: RaffleApiResponse) => {
          const ticketPrice = typeof raffle.ticket_price === 'number' ? raffle.ticket_price : parseFloat(raffle.ticket_price?.toString() || '0') || 0;
          const ticketsSold = raffle.tickets_sold ?? 0;
          const ticketRevenue = ticketPrice * ticketsSold;
          const currentAmount = parseFloat((raffle.current_amount ?? 0).toString()) || 0;
          const donationAmount = Math.max(0, currentAmount - ticketRevenue);
          
          return {
            id: raffle.id,
            title: raffle.title || raffle.host_name || 'Untitled Raffle',
            prize: raffle.prize || raffle.description || 'No prize specified',
            description: raffle.description || '',
            hostName: raffle.host_name || 'Unknown Host',
            target: raffle.target || 0,
            currentTickets: ticketsSold,
            totalTickets: raffle.total_tickets ?? 0,
            endDate: raffle.ending_date,
            ticketPrice: ticketPrice,
            type: raffle.type,
            currentAmount: currentAmount,
            ticketRevenue: ticketRevenue,
            donationAmount: donationAmount,
            imageUrl: raffle.image1_url || 
                     (raffle.images && raffle.images.length > 0 ? raffle.images[0].url : null) ||
                     '/images/tb2.png',
            category: raffle.category?.category_name || 'N/A',
            images: raffle.images || [],
          };
        });

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
    setDonationAmount('');
    setDonationMode(raffle.type === 'fundraising');
    setPurchaseError(null);
    setPurchaseSuccess(null);
  };

  const closeRaffleModal = () => {
    setShowRaffleModal(false);
    setSelectedRaffle(null);
    setTicketQuantity(1);
    setDonationAmount('');
    setDonationMode(false);
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
      const response = await fetch(`${API_BASE_URL}/payments/tickets/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          raffle_id: selectedRaffle.id,
          quantity: ticketQuantity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to create payment checkout');
      }

      const result = await response.json();
      
      if (result.success && result.checkout_url) {
        // Redirect to Paddle checkout
        window.location.href = result.checkout_url;
      } else {
        throw new Error(result.error || 'Failed to create payment checkout');
      }

    } catch (err) {
      setPurchaseError(err instanceof Error ? err.message : 'Failed to create payment checkout');
    } finally {
      setPurchasing(false);
    }
  };

  const handleDonation = async () => {
    if (!selectedRaffle || !user) {
      setPurchaseError('Please log in to make a donation');
      return;
    }

    const amount = parseFloat(donationAmount);
    if (isNaN(amount) || amount <= 0) {
      setPurchaseError('Please enter a valid donation amount');
      return;
    }

    setPurchasing(true);
    setPurchaseError(null);
    setPurchaseSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/payments/donations/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          raffle_id: selectedRaffle.id,
          amount: amount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to create donation checkout');
      }

      const result = await response.json();
      
      if (result.success && result.checkout_url) {
        // Redirect to Paddle checkout
        window.location.href = result.checkout_url;
      } else {
        throw new Error(result.error || 'Failed to create donation checkout');
      }

    } catch (err) {
      setPurchaseError(err instanceof Error ? err.message : 'Failed to create donation checkout');
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
                      target.src = '/images/tb2.png';
                    }}
                  />
                  {/* Additional Images Indicator */}
                  {raffle.images && raffle.images.length > 1 && (
                    <div className="absolute bottom-2 left-2">
                      <span className="backdrop-blur bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                        📷 {raffle.images.length} photos
                      </span>
                    </div>
                  )}
                  {/* Type Badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      raffle.type === 'raffle' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {raffle.type === 'raffle' ? 'Raffle' : 'Fundraising'}
                    </span>
                  </div>
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
                    {raffle.type === 'raffle' ? (
                      <>
                        <div className="space-y-2 mb-3">
                          <p className="text-gray-700 text-sm">
                            <span className="font-semibold">Money Collected:</span> ${(raffle.currentAmount || 0).toFixed(2)}
                            <span className="text-xs text-gray-500 ml-2">
                              (${(raffle.ticketRevenue || 0).toFixed(2)} from tickets
                              {(raffle.donationAmount || 0) > 0 && `, $${(raffle.donationAmount || 0).toFixed(2)} from donations`})
                            </span>
                          </p>
                          <p className="text-gray-700 text-sm">Tickets: <span className="font-semibold">{raffle.currentTickets}</span> / {raffle.totalTickets}</p>
                        </div>
                        
                        {/* Money Progress Bar */}
                        <div className="mb-2">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Progress to Goal</span>
                            <span>{raffle.target ? Math.round(((raffle.currentAmount || 0) / raffle.target) * 100) : 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-green-600 h-2.5 rounded-full" style={{ 
                              width: `${raffle.target ? Math.min(((raffle.currentAmount || 0) / raffle.target) * 100, 100) : 0}%` 
                            }}></div>
                          </div>
                          <p className="text-gray-700 text-xs mt-1">Goal: <span className="font-semibold">${raffle.target?.toLocaleString()}</span></p>
                        </div>
                        
                        {/* Ticket Progress Bar */}
                        <div>
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Tickets Sold</span>
                            <span>{raffle.totalTickets ? Math.round((raffle.currentTickets / raffle.totalTickets) * 100) : 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 text-sm mt-2">Ticket Price: <span className="font-semibold">${typeof raffle.ticketPrice === 'number' ? raffle.ticketPrice.toFixed(2) : 'N/A'}</span></p>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-700 text-sm">Amount Raised: <span className="font-semibold">${(raffle.currentAmount || 0)?.toLocaleString()}</span></p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                          <div className="bg-green-600 h-2.5 rounded-full" style={{ 
                            width: `${raffle.target ? Math.min(((raffle.currentAmount || 0) / raffle.target) * 100, 100) : 0}%` 
                          }}></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-600 mt-1">
                          <span>Goal: <span className="font-semibold">${raffle.target?.toLocaleString()}</span></span>
                          <span>{raffle.target ? Math.round(((raffle.currentAmount || 0) / raffle.target) * 100) : 0}%</span>
                        </div>
                      </>
                    )}
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
                    {raffle.type === 'raffle' ? 'Enter Now' : 'Donate Now'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Raffle Details and Purchase Modal */}
      {showRaffleModal && selectedRaffle && (
        <div className="fixed inset-0 backdrop-blur-sm transition-opacity flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="relative">
              <img 
                src={selectedRaffle.imageUrl} 
                alt={selectedRaffle.title}
                className="w-full h-64 object-cover rounded-t-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/tb2.png';
                }}
              />
              <button
                onClick={closeRaffleModal}
                className="absolute top-4 right-4 backdrop-blur bg-opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75 text-xl"
              >
                ✕
              </button>
              {/* Additional Images Indicator */}
              {selectedRaffle.images && selectedRaffle.images.length > 1 && (
                <div className="absolute bottom-4 left-4">
                  <span className="backdrop-blur bg-opacity-70 text-white px-3 py-1 rounded text-sm">
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
                  <h3 className="text-sm font-semibold text-gray-600 mb-1">Total Collected</h3>
                  <p className="text-xl font-bold text-green-600">${(selectedRaffle.currentAmount || 0).toFixed(2)}</p>
                  {selectedRaffle.type === 'raffle' && (selectedRaffle.donationAmount || 0) > 0 && (
                    <p className="text-xs text-gray-500">
                      ${(selectedRaffle.ticketRevenue || 0).toFixed(2)} tickets + ${(selectedRaffle.donationAmount || 0).toFixed(2)} donations
                    </p>
                  )}
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-600 mb-1">Target Goal</h3>
                  <p className="text-xl font-bold text-blue-600">${selectedRaffle.target.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">
                    {selectedRaffle.target ? Math.round(((selectedRaffle.currentAmount || 0) / selectedRaffle.target) * 100) : 0}% reached
                  </p>
                </div>
                {selectedRaffle.type === 'raffle' ? (
                  <>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-semibold text-gray-600 mb-1">Ticket Price</h3>
                      <p className="text-xl font-bold text-purple-600">${typeof selectedRaffle.ticketPrice === 'number' ? selectedRaffle.ticketPrice.toFixed(2) : 'N/A'}</p>
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
                  </>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg col-span-2">
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">Fundraising Progress</h3>
                    <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
                      <div 
                        className="bg-green-600 h-4 rounded-full flex items-center justify-center text-white text-xs font-semibold" 
                        style={{ 
                          width: `${selectedRaffle.target ? Math.min(((selectedRaffle.currentAmount || 0) / selectedRaffle.target) * 100, 100) : 0}%`,
                          minWidth: '2rem'
                        }}
                      >
                        {selectedRaffle.target ? Math.round(((selectedRaffle.currentAmount || 0) / selectedRaffle.target) * 100) : 0}%
                      </div>
                    </div>
                  </div>
                )}
                <div className="bg-gray-50 p-4 rounded-lg col-span-2">
                  <h3 className="text-sm font-semibold text-gray-600 mb-1">
                    {selectedRaffle.type === 'raffle' ? 'Draw Date' : 'End Date'}
                  </h3>
                  <p className="text-xl font-bold text-red-600">
                    {calculateDaysLeft(selectedRaffle.endDate)} day{calculateDaysLeft(selectedRaffle.endDate) !== 1 ? 's' : ''} left
                  </p>
                  <p className="text-sm text-gray-600">{new Date(selectedRaffle.endDate).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Purchase Section */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedRaffle.type === 'raffle' ? 'Purchase Tickets or Donate' : 'Make a Donation'}
                  </h2>
                  {selectedRaffle.type === 'raffle' && (
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setDonationMode(false)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          !donationMode 
                            ? 'bg-white text-blue-600 shadow-sm' 
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        🎟️ Buy Tickets
                      </button>
                      <button
                        onClick={() => setDonationMode(true)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          donationMode 
                            ? 'bg-white text-green-600 shadow-sm' 
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        💝 Donate
                      </button>
                    </div>
                  )}
                </div>
                
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
                    <p className="mb-2">Please log in to {selectedRaffle.type === 'raffle' ? 'purchase tickets or donate' : 'make a donation'}</p>
                    <button
                      onClick={() => window.location.href = '/login'}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Log In
                    </button>
                  </div>
                ) : (donationMode || selectedRaffle.type === 'fundraising') ? (
                  /* Donation Section */
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="donation-amount" className="block text-sm font-medium text-gray-700 mb-2">
                        Donation Amount ($)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">$</span>
                        <input
                          id="donation-amount"
                          type="number"
                          min="1"
                          step="0.01"
                          value={donationAmount}
                          onChange={(e) => setDonationAmount(e.target.value)}
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter amount"
                          disabled={purchasing}
                        />
                      </div>
                    </div>

                    {/* Quick donation amounts */}
                    <div className="grid grid-cols-4 gap-2">
                      {[5, 10, 25, 50].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setDonationAmount(amount.toString())}
                          className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                          disabled={purchasing}
                        >
                          ${amount}
                        </button>
                      ))}
                    </div>

                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                      <span className="text-lg font-semibold text-green-800">Your Donation:</span>
                      <span className="text-2xl font-bold text-green-600">
                        ${donationAmount ? parseFloat(donationAmount).toFixed(2) : '0.00'}
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
                        onClick={handleDonation}
                        disabled={purchasing || !donationAmount || parseFloat(donationAmount) <= 0}
                        className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {purchasing ? 'Processing...' : `Donate $${donationAmount ? parseFloat(donationAmount).toFixed(2) : '0.00'}`}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Ticket Purchase Section */
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

                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                      <span className="text-lg font-semibold text-blue-800">Total Cost:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        ${typeof selectedRaffle.ticketPrice === 'number' ? (selectedRaffle.ticketPrice * ticketQuantity).toFixed(2) : 'N/A'}
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
                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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