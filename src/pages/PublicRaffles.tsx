import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants/constants';
import { useAuth } from '../context/authUtils';
import { Hero } from '../components/main/Hero';
import RaffleCard, { Raffle as RaffleCardData } from '../components/shared/RaffleCard';
import RaffleDetailsModal from '../components/shared/RaffleDetailsModal';
import PaymentOptions from '../components/shared/PaymentOptions';

const PublicRaffles = () => {
  const { user } = useAuth();
  const { id: shareId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [raffles, setRaffles] = useState<RaffleCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingShareRaffle, setFetchingShareRaffle] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRaffle, setSelectedRaffle] = useState<RaffleCardData | null>(null);
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
          share_id?: string; // Add share_id
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
            share_id: raffle.share_id || `raffle-${raffle.id}`, // Fallback for share_id
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
            status: 'active',
          } as RaffleCardData;
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

  // Effect to handle direct raffle links via share_id
  useEffect(() => {
    const handleShareIdLink = async () => {
      if (!shareId) return;
      
      // First, try to find the raffle in the preloaded list
      if (raffles.length > 0) {
        const targetRaffle = raffles.find(raffle => raffle.share_id === shareId);
        if (targetRaffle) {
          openRaffleModal(targetRaffle);
          // Clear the share_id from the URL after opening the modal
          navigate('/raffles', { replace: true });
          return;
        }
      }
      
      // If not found in preloaded list and raffles have been loaded, fetch from backend
      if (raffles.length > 0) {
        setFetchingShareRaffle(true);
        try {
          const response = await fetch(`${API_BASE_URL}/raffles/share/${shareId}`);
          if (response.ok) {
            const raffleData = await response.json();
            
            // Transform the API response to match our RaffleCardData format
            const ticketPrice = typeof raffleData.ticket_price === 'number' ? raffleData.ticket_price : parseFloat(raffleData.ticket_price?.toString() || '0') || 0;
            const ticketsSold = raffleData.tickets_sold ?? 0;
            const ticketRevenue = ticketPrice * ticketsSold;
            const currentAmount = parseFloat((raffleData.current_amount ?? 0).toString()) || 0;
            const donationAmount = Math.max(0, currentAmount - ticketRevenue);
            
            const transformedRaffle: RaffleCardData = {
              id: raffleData.id,
              share_id: raffleData.share_id || `raffle-${raffleData.id}`,
              title: raffleData.title || raffleData.host_name || 'Untitled Raffle',
              prize: raffleData.prize || raffleData.description || 'No prize specified',
              description: raffleData.description || '',
              hostName: raffleData.host_name || 'Unknown Host',
              target: raffleData.target || 0,
              currentTickets: ticketsSold,
              totalTickets: raffleData.total_tickets ?? 0,
              endDate: raffleData.ending_date,
              ticketPrice: ticketPrice,
              type: raffleData.type,
              currentAmount: currentAmount,
              ticketRevenue: ticketRevenue,
              donationAmount: donationAmount,
              imageUrl: raffleData.image1_url || 
                       (raffleData.images && raffleData.images.length > 0 ? raffleData.images[0].url : null) ||
                       '/images/tb2.png',
              category: raffleData.category?.category_name || 'N/A',
              status: 'active',
            };
            
            // Check if the raffle is still active
            const now = new Date();
            const endDate = new Date(raffleData.ending_date);
            
            if (endDate > now && raffleData.approve_status === 'approved') {
              openRaffleModal(transformedRaffle);
              // Clear the share_id from the URL after opening the modal
              navigate('/raffles', { replace: true });
            } else {
              // Raffle is expired or not approved
              setError('This raffle is no longer available or has expired.');
            }
          } else {
            setError('Raffle not found. It may have been removed or is no longer available.');
          }
        } catch (err) {
          console.error('Error fetching raffle by share_id:', err);
          setError('Failed to load the requested raffle. Please try again later.');
        } finally {
          setFetchingShareRaffle(false);
        }
      }
    };
    
    handleShareIdLink();
  }, [shareId, raffles, navigate]);

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

  const handleShare = async (raffle: RaffleCardData) => {
    const shareUrl = `${window.location.origin}/raffles/${raffle.share_id}`;
    const shareData = {
      title: raffle.title,
      text: `Check out this raffle: ${raffle.title}`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('Raffle link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Raffle link copied to clipboard!');
      } catch (clipboardError) {
        console.error('Error copying to clipboard:', clipboardError);
      }
    }
  };

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
    
    // If we came from a share link, clear the URL
    if (shareId) {
      navigate('/raffles', { replace: true });
    }
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

  if (loading || fetchingShareRaffle) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="loader"></div> 
        {fetchingShareRaffle ? 'Loading raffle...' : 'Loading Raffles...'}
        <style>{`
          .loader {
            border: 4px solid #e5e7eb;
            border-top: 4px solid #4f46e5;
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
      <div className="p-6 bg-gray-50 min-h-screen text-red-600 text-center text-lg">
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
      <div className="bg-slate-800 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-indigo-400 mb-6 sm:mb-8">
            Current <span className='text-white'>Opportunities</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="text-center text-white">
              <div className="text-3xl sm:text-4xl font-bold text-indigo-400 mb-2">{raffles.length}</div>
              <div className="text-base sm:text-lg text-slate-300">Active Campaigns</div>
            </div>
            <div className="text-center text-white">
              <div className="text-3xl sm:text-4xl font-bold text-indigo-400 mb-2">
                {raffles.filter(r => r.type === 'raffle').length}
              </div>
              <div className="text-base sm:text-lg text-slate-300">Live Raffles</div>
            </div>
            <div className="text-center text-white">
              <div className="text-3xl sm:text-4xl font-bold text-indigo-400 mb-2">
                {raffles.filter(r => r.type === 'fundraising').length}
              </div>
              <div className="text-base sm:text-lg text-slate-300">Fundraising Campaigns</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div id="raffles" className="bg-gray-50 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {raffles.length === 0 ? (
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md text-center">
              <p className="text-gray-500 text-lg">No active raffles or fundraising campaigns at the moment.</p>
              <p className="text-gray-400 mt-2">Check back soon for new opportunities!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {raffles.map((raffle) => (
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
        </div>
      </div>

      {/* Raffle Details Modal */}
      {selectedRaffle && (
        <RaffleDetailsModal
          raffle={selectedRaffle}
          isOpen={showRaffleModal}
          onClose={closeRaffleModal}
          onShare={handleShare}
          timeLeft={timeLeft[selectedRaffle.id]}
        >
          {/* Custom Purchase/Donation Section */}
          <div className="border-t pt-4 sm:pt-6 lg:pt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-800">
                {selectedRaffle.type === 'raffle' ? 'Purchase Tickets or Donate' : 'Make a Donation'}
              </h2>
              {selectedRaffle.type === 'raffle' && (
                <div className="flex bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => setDonationMode(false)}
                    className={`px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-medium transition-colors ${
                      !donationMode 
                        ? 'bg-white text-indigo-600 shadow-sm' 
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    Buy Tickets
                  </button>
                  <button
                    onClick={() => setDonationMode(true)}
                    className={`px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-medium transition-colors ${
                      donationMode 
                        ? 'bg-white text-emerald-600 shadow-sm' 
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    Donate
                  </button>
                </div>
              )}
            </div>
            
            {purchaseSuccess && (
              <div className="mb-4 p-4 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg">
                {purchaseSuccess}
              </div>
            )}

            {purchaseError && (
              <div className="mb-4 p-4 bg-rose-100 border border-rose-300 text-rose-800 rounded-lg">
                {purchaseError}
              </div>
            )}

            {!user ? (
              <div className="text-center p-4 sm:p-6 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg">
                <h3 className="text-base sm:text-lg font-semibold mb-2">Join the Fun!</h3>
                <p className="mb-4 text-sm sm:text-base">Please create an account or log in to {selectedRaffle.type === 'raffle' ? 'purchase tickets or donate' : 'make a donation'}</p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                  <button
                    onClick={() => window.location.href = '/login'}
                    className="px-4 sm:px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm sm:text-base"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => window.location.href = '/register'}
                    className="px-4 sm:px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold text-sm sm:text-base"
                  >
                    Sign Up
                  </button>
                  <button
                    onClick={closeRaffleModal}
                    className="px-4 sm:px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (donationMode || selectedRaffle.type === 'fundraising') ? (
              /* Donation Section */
              <div className="space-y-6">
                <div>
                  <label htmlFor="donation-amount" className="block text-lg font-medium text-slate-600 mb-3">
                    Donation Amount ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-4 text-slate-400 text-lg">$</span>
                    <input
                      id="donation-amount"
                      type="number"
                      min="1"
                      step="0.01"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      className="w-full pl-10 pr-4 py-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg"
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
                      className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium"
                      disabled={purchasing}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between items-center p-6 bg-emerald-50 rounded-lg">
                  <span className="text-xl font-semibold text-emerald-800">Your Donation:</span>
                  <span className="text-3xl font-bold text-emerald-600">
                    ${donationAmount ? parseFloat(donationAmount).toFixed(2) : '0.00'}
                  </span>
                </div>

                <PaymentOptions
                  onPayPalClick={() => handlePayment('paypal')}
                  onCancel={closeRaffleModal}
                  disabled={!donationAmount || parseFloat(donationAmount) <= 0}
                  purchasing={purchasing}
                />
              </div>
            ) : (
              /* Ticket Purchase Section */
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <label htmlFor="quantity" className="text-lg font-medium text-slate-600">
                    Number of tickets:
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                      className="w-10 h-10 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors flex items-center justify-center text-lg font-bold"
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
                      className="w-20 text-center border border-slate-300 rounded-lg px-3 py-2 text-lg font-semibold"
                      disabled={purchasing}
                    />
                    <button
                      onClick={() => setTicketQuantity(Math.min(10, ticketQuantity + 1))}
                      className="w-10 h-10 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors flex items-center justify-center text-lg font-bold"
                      disabled={purchasing}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center p-6 bg-indigo-50 rounded-lg">
                  <span className="text-xl font-semibold text-indigo-800">Total Cost:</span>
                  <span className="text-3xl font-bold text-indigo-600">
                    ${typeof selectedRaffle.ticketPrice === 'number' ? (selectedRaffle.ticketPrice * ticketQuantity).toFixed(2) : 'N/A'}
                  </span>
                </div>

                <PaymentOptions
                  onPayPalClick={() => handlePayment('paypal')}
                  onCancel={closeRaffleModal}
                  disabled={false}
                  purchasing={purchasing}
                />
              </div>
            )}
          </div>
        </RaffleDetailsModal>
      )}
    </>
  );
};

export default PublicRaffles;
