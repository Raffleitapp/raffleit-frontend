import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../constants/constants';
import { useAuth } from '../context/authUtils';
import { Hero } from '../components/main/Hero';

// Define a type for a single raffle
interface PublicRaffle {
  id: number;
  title: string;
  prize: string;
  description?: string;
  hostName: string;
  currentTickets: number;
  totalTickets: number;
  endDate: string;
  ticketPrice: number;
  imageUrl: string;
  category: string;
  target: number;
  type: 'raffle' | 'fundraising';
  currentAmount: number;
  ticketRevenue: number;
  donationAmount: number;
  images?: Array<{
    id: number;
    path: string;
    url: string;
  }>;
}

const PublicRaffles = () => {
  const { user } = useAuth();
  const [raffles, setRaffles] = useState<PublicRaffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRaffle, setSelectedRaffle] = useState<PublicRaffle | null>(null);
  const [showRaffleModal, setShowRaffleModal] = useState(false);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [donationAmount, setDonationAmount] = useState<string>('');
  const [donationMode, setDonationMode] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchRaffles = async () => {
      setLoading(true);
      setError(null);

      try {
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

        const res = await fetch(`${API_BASE_URL}/raffles`);
        if (!res.ok) throw new Error('Failed to fetch raffles');
        const data: RaffleApiResponse[] = await res.json();

        // Filter for approved and active raffles
        const now = new Date();
        const activeRaffles = data.filter((raffle: RaffleApiResponse) => {
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

        setRaffles(activeRaffles);
      } catch (err) {
        console.error("Failed to fetch raffles:", err);
        setError("Failed to load raffles. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRaffles();
  }, []);

  const calculateTimeLeft = (endDate: string) => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const difference = end - now;

    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        total: difference
      };
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  };

  // Countdown timer state and effect
  const [timeLeft, setTimeLeft] = useState<{[key: number]: ReturnType<typeof calculateTimeLeft>}>({});

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft: {[key: number]: ReturnType<typeof calculateTimeLeft>} = {};
      raffles.forEach(raffle => {
        newTimeLeft[raffle.id] = calculateTimeLeft(raffle.endDate);
      });
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [raffles]);

  const openRaffleModal = (raffle: PublicRaffle) => {
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
        <div className="loader"></div> Loading Raffles...
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
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
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
    <>
      <Hero
        backgroundImage='/images/tb2.png'
        title='Live Raffles & Fundraising'
        subtitle='Discover amazing prizes and support great causes. Join our community and participate in exciting raffles or contribute to meaningful fundraising campaigns.'
        linkText="View All Raffles"
        linkHref='#raffles'
        height={70}
      />
      
      {/* Stats Section */}
      <div className="bg-text-primary py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-btn-primary mb-8">
            Current <span className='text-white'>Opportunities</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="text-center text-white">
              <div className="text-4xl font-bold text-btn-primary mb-2">{raffles.length}</div>
              <div className="text-lg">Active Campaigns</div>
            </div>
            <div className="text-center text-white">
              <div className="text-4xl font-bold text-btn-primary mb-2">
                {raffles.filter(r => r.type === 'raffle').length}
              </div>
              <div className="text-lg">Live Raffles</div>
            </div>
            <div className="text-center text-white">
              <div className="text-4xl font-bold text-btn-primary mb-2">
                {raffles.filter(r => r.type === 'fundraising').length}
              </div>
              <div className="text-lg">Fundraising Campaigns</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div id="raffles" className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-6">
          {raffles.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <p className="text-gray-600 text-lg">No active raffles or fundraising campaigns at the moment.</p>
              <p className="text-gray-500 mt-2">Check back soon for new opportunities!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {raffles.map((raffle) => {
                return (
                  <div key={raffle.id} className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                    <div className="relative">
                      <img 
                        src={raffle.imageUrl} 
                        alt={raffle.title} 
                        className="w-full h-56 object-cover" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/tb2.png';
                        }}
                      />
                      {/* Additional Images Indicator */}
                      {raffle.images && raffle.images.length > 1 && (
                        <div className="absolute bottom-2 left-2">
                          <span className="backdrop-blur bg-gray-900 bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                            {raffle.images.length} photos
                          </span>
                        </div>
                      )}
                      {/* Type Badge */}
                      <div className="absolute top-3 left-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          raffle.type === 'raffle' 
                            ? 'bg-purple-500 text-white' 
                            : 'bg-green-500 text-white'
                        }`}>
                          {raffle.type === 'raffle' ? 'RAFFLE' : 'FUNDRAISING'}
                        </span>
                      </div>
                      {/* Category Badge */}
                      <div className="absolute top-3 right-3">
                        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          {raffle.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2 line-clamp-2">{raffle.title}</h2>
                      <p className="text-base text-blue-600 mb-4 font-semibold line-clamp-2">{raffle.prize}</p>

                      <div className="mb-6 space-y-2">
                        {raffle.type === 'raffle' ? (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 text-sm">Ticket Price:</span>
                              <span className="font-bold text-lg text-green-600">
                                ${typeof raffle.ticketPrice === 'number' ? raffle.ticketPrice.toFixed(2) : 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 text-sm">Tickets:</span>
                              <span className="font-semibold">
                                {raffle.currentTickets} / {raffle.totalTickets}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm">Goal:</span>
                            <span className="font-bold text-lg text-green-600">
                              ${raffle.target.toLocaleString()}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 text-sm">Time left:</span>
                          <div className="text-right">
                            {timeLeft[raffle.id] && timeLeft[raffle.id].total > 0 ? (
                              <div className="font-bold text-red-600 text-sm">
                                <div className="flex gap-1 text-xs">
                                  <span className="bg-red-100 px-1 rounded">{timeLeft[raffle.id].days}d</span>
                                  <span className="bg-red-100 px-1 rounded">{timeLeft[raffle.id].hours}h</span>
                                  <span className="bg-red-100 px-1 rounded">{timeLeft[raffle.id].minutes}m</span>
                                  <span className="bg-red-100 px-1 rounded">{timeLeft[raffle.id].seconds}s</span>
                                </div>
                              </div>
                            ) : (
                              <span className="font-bold text-gray-500 text-sm">Ended</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => openRaffleModal(raffle)}
                          className="flex-1 px-4 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => openRaffleModal(raffle)}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-600 transition-all transform hover:scale-105"
                        >
                          {raffle.type === 'raffle' ? 'Enter Now' : 'Donate Now'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Raffle Details Modal */}
      {showRaffleModal && selectedRaffle && (
        <div className="fixed inset-0 backdrop-blur-sm transition-opacity bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="relative">
              <img 
                src={selectedRaffle.imageUrl} 
                alt={selectedRaffle.title}
                className="w-full h-64 object-cover rounded-t-xl"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/tb2.png';
                }}
              />
              <button
                onClick={closeRaffleModal}
                className="absolute top-4 right-4 bg-gray-900 bg-opacity-60 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-80 text-xl"
              >
                ✕
              </button>
              {/* Additional Images Indicator */}
              {selectedRaffle.images && selectedRaffle.images.length > 1 && (
                <div className="absolute bottom-4 left-4">
                  <span className="bg-gray-900 bg-opacity-60 text-white px-3 py-1 rounded text-sm">
                    {selectedRaffle.images.length} photos
                  </span>
                </div>
              )}
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <div className="mb-6">
                <h1 className="text-4xl font-bold text-gray-900 mb-3">{selectedRaffle.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                    {selectedRaffle.category}
                  </span>
                  <span className={`px-3 py-1 rounded-full font-semibold ${
                    selectedRaffle.type === 'raffle' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {selectedRaffle.type === 'raffle' ? 'Raffle' : 'Fundraising'}
                  </span>
                  <span>Host: {selectedRaffle.hostName}</span>
                </div>
              </div>

              {/* Prize Information */}
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">Prize</h2>
                <p className="text-lg text-blue-700 font-semibold">{selectedRaffle.prize}</p>
              </div>

              {/* Description */}
              {selectedRaffle.description && (
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-3">Description</h2>
                  <p className="text-gray-700 leading-relaxed">{selectedRaffle.description}</p>
                </div>
              )}

              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Collected</h3>
                  <p className="text-3xl font-bold text-green-600">${(selectedRaffle.currentAmount || 0).toFixed(2)}</p>
                  {selectedRaffle.type === 'raffle' && (selectedRaffle.donationAmount || 0) > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      ${(selectedRaffle.ticketRevenue || 0).toFixed(2)} tickets + ${(selectedRaffle.donationAmount || 0).toFixed(2)} donations
                    </p>
                  )}
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Target Goal</h3>
                  <p className="text-3xl font-bold text-blue-600">${selectedRaffle.target.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedRaffle.target ? Math.round(((selectedRaffle.currentAmount || 0) / selectedRaffle.target) * 100) : 0}% reached
                  </p>
                </div>
                {selectedRaffle.type === 'raffle' && (
                  <>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
                      <h3 className="text-sm font-semibold text-gray-600 mb-2">Ticket Price</h3>
                      <p className="text-3xl font-bold text-purple-600">
                        ${typeof selectedRaffle.ticketPrice === 'number' ? selectedRaffle.ticketPrice.toFixed(2) : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg">
                      <h3 className="text-sm font-semibold text-gray-600 mb-2">Tickets Sold</h3>
                      <p className="text-3xl font-bold text-gray-900">
                        {selectedRaffle.currentTickets} / {selectedRaffle.totalTickets}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                        <div 
                          className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                          style={{ 
                            width: `${selectedRaffle.totalTickets ? (selectedRaffle.currentTickets / selectedRaffle.totalTickets) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </>
                )}
                <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg md:col-span-2">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">
                    {selectedRaffle.type === 'raffle' ? 'Draw Date' : 'End Date'}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      {timeLeft[selectedRaffle.id] && timeLeft[selectedRaffle.id].total > 0 ? (
                        <div>
                          <div className="flex gap-2 mb-2">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-red-600">{timeLeft[selectedRaffle.id].days}</div>
                              <div className="text-xs text-gray-600">Days</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-red-600">{timeLeft[selectedRaffle.id].hours}</div>
                              <div className="text-xs text-gray-600">Hours</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-red-600">{timeLeft[selectedRaffle.id].minutes}</div>
                              <div className="text-xs text-gray-600">Minutes</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-red-600">{timeLeft[selectedRaffle.id].seconds}</div>
                              <div className="text-xs text-gray-600">Seconds</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-2xl font-bold text-gray-500">Campaign Ended</p>
                      )}
                    </div>
                    <p className="text-lg text-gray-600">{new Date(selectedRaffle.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Purchase Section */}
              <div className="border-t pt-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {selectedRaffle.type === 'raffle' ? 'Purchase Tickets or Donate' : 'Make a Donation'}
                  </h2>
                  {selectedRaffle.type === 'raffle' && (
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setDonationMode(false)}
                        className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                          !donationMode 
                            ? 'bg-white text-blue-600 shadow-sm' 
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        Buy Tickets
                      </button>
                      <button
                        onClick={() => setDonationMode(true)}
                        className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                          donationMode 
                            ? 'bg-white text-green-600 shadow-sm' 
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        Donate
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
                  <div className="text-center p-6 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Join the Fun!</h3>
                    <p className="mb-4">Please create an account or log in to {selectedRaffle.type === 'raffle' ? 'purchase tickets or donate' : 'make a donation'}</p>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => window.location.href = '/login'}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                      >
                        Log In
                      </button>
                      <button
                        onClick={() => window.location.href = '/register'}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                      >
                        Sign Up
                      </button>
                    </div>
                  </div>
                ) : (donationMode || selectedRaffle.type === 'fundraising') ? (
                  /* Donation Section */
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="donation-amount" className="block text-lg font-medium text-gray-700 mb-3">
                        Donation Amount ($)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-4 text-gray-500 text-lg">$</span>
                        <input
                          id="donation-amount"
                          type="number"
                          min="1"
                          step="0.01"
                          value={donationAmount}
                          onChange={(e) => setDonationAmount(e.target.value)}
                          className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                          placeholder="Enter amount"
                          disabled={purchasing}
                        />
                      </div>
                    </div>

                    {/* Quick donation amounts */}
                    <div className="grid grid-cols-4 gap-3">
                      {[5, 10, 25, 50].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setDonationAmount(amount.toString())}
                          className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                          disabled={purchasing}
                        >
                          ${amount}
                        </button>
                      ))}
                    </div>

                    <div className="flex justify-between items-center p-6 bg-green-50 rounded-lg">
                      <span className="text-xl font-semibold text-green-800">Your Donation:</span>
                      <span className="text-3xl font-bold text-green-600">
                        ${donationAmount ? parseFloat(donationAmount).toFixed(2) : '0.00'}
                      </span>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={closeRaffleModal}
                        className="flex-1 px-6 py-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                        disabled={purchasing}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDonation}
                        disabled={purchasing || !donationAmount || parseFloat(donationAmount) <= 0}
                        className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                      >
                        {purchasing ? 'Processing...' : `Donate $${donationAmount ? parseFloat(donationAmount).toFixed(2) : '0.00'}`}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Ticket Purchase Section */
                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                      <label htmlFor="quantity" className="text-lg font-medium text-gray-700">
                        Number of tickets:
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                          className="w-10 h-10 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center text-lg font-bold"
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
                          className="w-20 text-center border border-gray-300 rounded-lg px-3 py-2 text-lg font-semibold"
                          disabled={purchasing}
                        />
                        <button
                          onClick={() => setTicketQuantity(Math.min(10, ticketQuantity + 1))}
                          className="w-10 h-10 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center text-lg font-bold"
                          disabled={purchasing}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-6 bg-blue-50 rounded-lg">
                      <span className="text-xl font-semibold text-blue-800">Total Cost:</span>
                      <span className="text-3xl font-bold text-blue-600">
                        ${typeof selectedRaffle.ticketPrice === 'number' ? (selectedRaffle.ticketPrice * ticketQuantity).toFixed(2) : 'N/A'}
                      </span>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={closeRaffleModal}
                        className="flex-1 px-6 py-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                        disabled={purchasing}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handlePurchaseTickets}
                        disabled={purchasing}
                        className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
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
    </>
  );
};

export default PublicRaffles;
