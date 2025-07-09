import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../constants/constants';
import { useAuth } from '../../context/authUtils';
import RaffleCard, { Raffle as RaffleCardData } from '../../components/shared/RaffleCard';
import RaffleDetailsModal from '../../components/shared/RaffleDetailsModal';
import PaymentOptions from '../../components/shared/PaymentOptions';

const LiveRaffles = () => {
  const { user } = useAuth();
  const [liveRaffles, setLiveRaffles] = useState<RaffleCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRaffle, setSelectedRaffle] = useState<RaffleCardData | null>(null);
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
          share_id?: string;
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
          category?: { category_name?: string };
          approve_status?: string;
        }

        // Fetch all raffles, then filter for live ones (you can adjust API to support status filter)
        const res = await fetch(`${API_BASE_URL}/raffles`);
        if (!res.ok) throw new Error('Failed to fetch raffles');
        const data: RaffleApiResponse[] = await res.json();

        // Filter for live raffles (assuming status or endDate logic)
        const now = new Date();
        const liveRafflesData = data.filter((raffle: RaffleApiResponse) => {
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
            share_id: raffle.share_id || `raffle-${raffle.id}`,
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
                     '/images/tb2.png',
            category: raffle.category?.category_name || 'N/A',
            status: 'active',
          } as RaffleCardData;
        });

        setLiveRaffles(liveRafflesData);
      } catch (err) {
        console.error("Failed to fetch live raffles:", err);
        setError("Failed to load live raffles. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLiveRaffles();
  }, []); // Empty dependency array means this runs once on mount

  // Real-time countdown timer state
  const [timeLeft, setTimeLeft] = useState<{ [key: number]: { days: number; hours: number; minutes: number; seconds: number } }>({});

  // Calculate time remaining for countdown
  const calculateTimeLeft = (endDate: string) => {
    const difference = new Date(endDate).getTime() - new Date().getTime();
    
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    }
    
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  };

  // Update timers every second
  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft: { [key: number]: { days: number; hours: number; minutes: number; seconds: number } } = {};
      liveRaffles.forEach((raffle) => {
        newTimeLeft[raffle.id] = calculateTimeLeft(raffle.endDate);
      });
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [liveRaffles]);

  const openRaffleModal = (raffle: RaffleCardData) => {
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

  const handlePayment = async (method: 'paddle' | 'paypal') => {
    if (!selectedRaffle || !user) {
      setPurchaseError('Please log in to proceed with payment.');
      return;
    }

    setPurchasing(true);
    setPurchaseError(null);
    setPurchaseSuccess(null);

    const isDonation = donationMode || selectedRaffle.type === 'fundraising';
    const amount = isDonation ? parseFloat(donationAmount) : (selectedRaffle.ticketPrice || 0) * ticketQuantity;
    
    if (isNaN(amount) || amount <= 0) {
      setPurchaseError('Please enter a valid amount.');
      setPurchasing(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (method === 'paypal') {
        // PayPal payment flow
        const endpoint = isDonation ? '/payments/paypal/donations' : '/payments/paypal/tickets';
        const body = {
          raffle_id: selectedRaffle.id,
          ...(isDonation ? { amount } : { quantity: ticketQuantity }),
        };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create PayPal payment.');
        }

        const result = await response.json();
        
        if (result.success && result.approval_url) {
          window.location.href = result.approval_url;
        } else {
          throw new Error(result.error || 'Failed to get PayPal approval URL.');
        }
        
      } else if (method === 'paddle') {
        // Paddle payment flow
        const endpoint = isDonation ? '/payments/paddle/donations' : '/payments/paddle/tickets';
        const body = {
          raffle_id: selectedRaffle.id,
          ...(isDonation ? { amount } : { quantity: ticketQuantity }),
        };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create Paddle checkout.');
        }

        const result = await response.json();
        
        if (result.success && result.checkout_url) {
          window.location.href = result.checkout_url;
        } else {
          throw new Error(result.error || 'Failed to get Paddle checkout URL.');
        }
      }

    } catch (err) {
      setPurchaseError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleShare = async (raffle: RaffleCardData) => {
    const shareUrl = `${window.location.origin}/raffles/${raffle.share_id}`;
    const shareData = {
      title: raffle.title,
      text: `Check out this ${raffle.type === 'raffle' ? 'raffle' : 'fundraiser'}: ${raffle.title}`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to copying link
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback to copying link
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      } catch (clipboardError) {
        console.error('Error copying to clipboard:', clipboardError);
      }
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
          {liveRaffles.map((raffle) => (
            <RaffleCard
              key={raffle.id}
              raffle={raffle}
              onViewDetails={openRaffleModal}
              onEnter={openRaffleModal}
              onShare={handleShare}
              timeLeft={timeLeft[raffle.id]}
            />
          ))}
        </div>
      )}

      {/* Raffle Details Modal */}
      {selectedRaffle && (
        <RaffleDetailsModal
          raffle={selectedRaffle}
          isOpen={showRaffleModal}
          onClose={closeRaffleModal}
          isDashboard={true}
          timeLeft={timeLeft[selectedRaffle.id] ? {
            ...timeLeft[selectedRaffle.id],
            total: (timeLeft[selectedRaffle.id].days * 24 * 60 * 60 * 1000) + 
                   (timeLeft[selectedRaffle.id].hours * 60 * 60 * 1000) + 
                   (timeLeft[selectedRaffle.id].minutes * 60 * 1000) + 
                   (timeLeft[selectedRaffle.id].seconds * 1000)
          } : undefined}
        >
          {/* Custom Purchase/Donation Section */}
          <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-800">
              {selectedRaffle?.type === 'raffle' ? 'Purchase Tickets or Donate' : 'Make a Donation'}
            </h2>
            {selectedRaffle?.type === 'raffle' && (
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setDonationMode(false)}
                  className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${!donationMode ? 'bg-white shadow' : 'text-slate-600'}`}
                >
                  Tickets
                </button>
                <button
                  onClick={() => setDonationMode(true)}
                  className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${donationMode ? 'bg-white shadow' : 'text-slate-600'}`}
                >
                  Donate
                </button>
              </div>
            )}
          </div>

          {purchaseSuccess && (
            <div className="mb-4 p-4 bg-emerald-100 border border-emerald-400 text-emerald-700 rounded-lg">
              {purchaseSuccess}
            </div>
          )}
          {purchaseError && (
            <div className="mb-4 p-4 bg-rose-100 border border-rose-400 text-rose-700 rounded-lg">
              {purchaseError}
            </div>
          )}

          {!user ? (
            <div className="text-center p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
              <p className="mb-2">Please log in to {selectedRaffle?.type === 'raffle' ? 'purchase tickets or donate' : 'make a donation'}</p>
              <button
                onClick={() => window.location.href = '/login'}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
              >
                Log In
              </button>
            </div>
          ) : (donationMode || selectedRaffle?.type === 'fundraising') ? (
            /* Donation Section */
            <div className="space-y-4">
              <div>
                <label htmlFor="donation-amount" className="block text-sm font-medium text-slate-700 mb-2">
                  Donation Amount ($)
                </label>
                <input
                  type="number"
                  id="donation-amount"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  placeholder="e.g., 25.00"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={purchasing}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {['10', '25', '50', '100', '250', '500'].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setDonationAmount(amount)}
                    className="px-4 py-2 bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200 transition-colors font-semibold"
                    disabled={purchasing}
                  >
                    ${amount}
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-lg">
                <span className="text-lg font-semibold text-emerald-800">Your Donation:</span>
                <span className="text-2xl font-bold text-emerald-600">
                  ${donationAmount ? parseFloat(donationAmount).toFixed(2) : '0.00'}
                </span>
              </div>

              <PaymentOptions
                onPayPalClick={() => handlePayment('paypal')}
                onPaddleClick={() => handlePayment('paddle')}
                disabled={!donationAmount || parseFloat(donationAmount) <= 0}
                purchasing={purchasing}
                isDashboard={true}
              />
            </div>
          ) : (
            /* Ticket Purchase Section */
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label htmlFor="quantity" className="text-sm font-medium text-slate-700">
                  Number of tickets:
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                    className="w-8 h-8 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors flex items-center justify-center"
                    disabled={purchasing}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    value={ticketQuantity}
                    onChange={(e) => setTicketQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-16 text-center border-slate-300 rounded-md"
                    disabled={purchasing}
                  />
                  <button
                    onClick={() => setTicketQuantity(ticketQuantity + 1)}
                    className="w-8 h-8 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors flex items-center justify-center"
                    disabled={purchasing}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-indigo-50 rounded-lg">
                <span className="text-lg font-semibold text-indigo-800">Total Price:</span>
                <span className="text-2xl font-bold text-indigo-600">
                  ${typeof selectedRaffle?.ticketPrice === 'number' ? (selectedRaffle.ticketPrice * ticketQuantity).toFixed(2) : 'N/A'}
                </span>
              </div>

              <PaymentOptions
                onPayPalClick={() => handlePayment('paypal')}
                onPaddleClick={() => handlePayment('paddle')}
                disabled={false}
                purchasing={purchasing}
                isDashboard={true}
              />
            </div>
          )}
        </div>
        </RaffleDetailsModal>
      )}
    </div>
  );
};

export default LiveRaffles;