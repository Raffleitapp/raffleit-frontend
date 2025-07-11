import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../constants/constants';
import { useAuth } from '../context/authUtils';
import { Hero } from '../components/main/Hero';
import RaffleCard, { Raffle as RaffleCardData } from '../components/shared/RaffleCard';
import RaffleDetailsModal from '../components/shared/RaffleDetailsModal';
import PaymentOptions from '../components/shared/PaymentOptions';
import PaymentProcessingModal from '../components/shared/PaymentProcessingModal';
import PaymentSuccessAlert from '../components/shared/PaymentSuccessAlert';
// PaymentStatusService removed - no longer using payment status polling

// Simple local type for payment status
interface PaymentStatusResponse {
  success: boolean;
  status: string;
  message: string;
  error?: string;
}

const PublicRaffles = () => {
  const { user } = useAuth();
  const { id: shareId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [raffles, setRaffles] = useState<RaffleCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingShareRaffle, setFetchingShareRaffle] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRaffle, setSelectedRaffle] = useState<RaffleCardData | null>(null);
  const [showRaffleModal, setShowRaffleModal] = useState(false);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [donationAmount, setDonationAmount] = useState<string>('');
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all' | 'raffle' | 'fundraising'>('all');
  // const [isInstantPayment, setIsInstantPayment] = useState(false);

  // New state for payment success details
  const [paymentSuccessDetails, setPaymentSuccessDetails] = useState<{
    amount: number;
    paymentMethod: string;
    transactionId: string;
    raffleTitle?: string;
    ticketQuantity?: number;
  } | null>(null);
  const [showPaymentSuccessAlert, setShowPaymentSuccessAlert] = useState(false);

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
          organisation?: {
            id: number;
            organisation_name: string;
            nick_name?: string;
            handle?: string;
            website?: string;
            description?: string;
            status?: string;
          };
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
            organisation: raffle.organisation,
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
              organisation: raffleData.organisation,
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

  // Handle payment success/failure notifications with enhanced instant payment feedback
  useEffect(() => {
    const paymentSuccess = searchParams.get('payment_success');
    const paymentFailed = searchParams.get('payment_failed');
    const paymentCancelled = searchParams.get('payment_cancelled');
    const paymentId = searchParams.get('payment_id');
    const instant = searchParams.get('instant');
    const error = searchParams.get('error');

    if (paymentSuccess === 'true' && paymentId) {
      // Extract payment details from URL parameters
      const amount = parseFloat(searchParams.get('amount') || '0');
      const method = searchParams.get('method') || 'unknown';
      const raffleTitle = searchParams.get('raffle_title') || selectedRaffle?.title;
      const quantity = parseInt(searchParams.get('quantity') || '1');

      // Set payment success details for the alert
      setPaymentSuccessDetails({
        amount: amount || (selectedRaffle ? (selectedRaffle.ticketPrice || 0) * ticketQuantity : 0),
        paymentMethod: method === 'unknown' ? 'PayPal' : method,
        transactionId: paymentId,
        raffleTitle: raffleTitle,
        ticketQuantity: selectedRaffle?.type === 'raffle' ? quantity || ticketQuantity : undefined,
      });

      if (instant === 'true') {
        // For instant payments, show immediate success
        setShowPaymentSuccessAlert(true);
        setPurchaseError(null);
        
        // Clear any pending payment modal
        setShowPaymentModal(false);
        setCurrentPaymentId(null);
      } else {
        // For regular payments, start polling to check status
        setCurrentPaymentId(paymentId);
        setShowPaymentModal(true);
        // setIsInstantPayment(false);
      }
    } else if (paymentFailed === 'true') {
      const errorMessage = error ? decodeURIComponent(error) : 'Payment failed. Please try again or contact support if the issue persists.';
      setPurchaseError(`❌ ${errorMessage}`);
      setPurchaseSuccess(null);
      
      // Clear any pending payment modal
      setShowPaymentModal(false);
      setCurrentPaymentId(null);
    } else if (paymentCancelled === 'true') {
      setPurchaseError('⚠️ Payment was cancelled. You can try again when ready.');
      setPurchaseSuccess(null);
      
      // Clear any pending payment modal
      setShowPaymentModal(false);
      setCurrentPaymentId(null);
    }

    // Clear the payment parameters from the URL after showing the notification
    if (paymentSuccess || paymentFailed || paymentCancelled) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('payment_success');
      newSearchParams.delete('payment_failed');
      newSearchParams.delete('payment_cancelled');
      newSearchParams.delete('payment_id');
      newSearchParams.delete('instant');
      newSearchParams.delete('error');
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

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
    setPurchaseError(null);
    setPurchaseSuccess(null);
  };

  const closeRaffleModal = () => {
    setShowRaffleModal(false);
    setSelectedRaffle(null);
    setTicketQuantity(1);
    setDonationAmount('');
    setPurchaseError(null);
    setPurchaseSuccess(null);
    
    // If we came from a share link, clear the URL
    if (shareId) {
      navigate('/raffles', { replace: true });
    }
  };

  // Enhanced payment handler with immediate feedback
  const handlePayment = async (method: 'paddle' | 'paypal') => {
    if (!selectedRaffle || !user) {
      setPurchaseError('Please log in to proceed with payment.');
      return;
    }

    setPurchasing(true);
    setPurchaseError(null);
    setPurchaseSuccess(null);

    const isDonation = selectedRaffle.type === 'fundraising';
    const amount = isDonation ? parseFloat(donationAmount) : (selectedRaffle.ticketPrice || 0) * ticketQuantity;

    if (isNaN(amount) || amount <= 0) {
      setPurchaseError('Please enter a valid amount.');
      setPurchasing(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payment_method = method;

      if (method === 'paypal') {
        // PayPal payment flow with immediate status tracking
        const endpoint = isDonation ? '/payments/paypal/donations' : '/payments/paypal/tickets';
        const body = {
          raffle_id: selectedRaffle.id,
          ...(isDonation ? { amount } : { quantity: ticketQuantity }),
          payment_method,
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
          // Store payment ID for status tracking when user returns
          localStorage.setItem('pendingPaymentId', result.payment_id);
          localStorage.setItem('paymentStartTime', Date.now().toString());
          
          // Show processing modal immediately for instant payment feedback
          setCurrentPaymentId(result.payment_id);
          setShowPaymentModal(true);
                      // setIsInstantPayment(result.instant_optimized || false);
          
          // Provide immediate feedback about instant payment optimization
          if (result.instant_optimized) {
            setPurchaseSuccess('Payment optimized for instant processing! Redirecting to PayPal...');
          } else {
            setPurchaseSuccess('Processing payment... Redirecting to PayPal...');
          }
          
          // Small delay to show the modal, then redirect
          setTimeout(() => {
            window.location.href = result.approval_url;
          }, 1500);
        } else {
          throw new Error(result.error || 'Failed to get PayPal approval URL.');
        }
      } else {
        // Paddle payment flow
        const endpoint = isDonation ? '/payments/paddle/donations' : '/payments/paddle/tickets';
        const body = {
          raffle_id: selectedRaffle.id,
          ...(isDonation ? { amount } : { quantity: ticketQuantity }),
          payment_method,
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
      console.error('Payment initiation error:', err);
      setPurchaseError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
      setPurchasing(false);
    }
  };

  // Handle payment completion
  const handlePaymentComplete = (status: PaymentStatusResponse) => {
    // Set payment success details for the alert
    if (selectedRaffle && currentPaymentId) {
      setPaymentSuccessDetails({
        amount: selectedRaffle.type === 'fundraising' 
          ? parseFloat(donationAmount) 
          : (selectedRaffle.ticketPrice || 0) * ticketQuantity,
        paymentMethod: 'paypal', // Default since this is likely from PayPal flow
        transactionId: currentPaymentId,
        raffleTitle: selectedRaffle.title,
        ticketQuantity: selectedRaffle.type === 'raffle' ? ticketQuantity : undefined,
      });
      setShowPaymentSuccessAlert(true);
    }
    
    setPurchaseSuccess(status.message);
    setPurchaseError(null);
    setShowRaffleModal(false);
    setShowPaymentModal(false);
    setPurchasing(false);
    setCurrentPaymentId(null);
  };

  // Handle payment failure
  const handlePaymentFailed = (status: PaymentStatusResponse) => {
    setPurchaseError(status.error || 'Payment failed. Please try again.');
    setShowPaymentModal(false);
    setCurrentPaymentId(null);
    localStorage.removeItem('pendingPaymentId');
  };

  // Clean up pending payments on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('payment_success') || urlParams.has('payment_failed')) {
      // Clear any pending payment IDs when returning from payment
      localStorage.removeItem('pendingPaymentId');
    }
  }, []);

  // Filter raffles based on type selection
  const filteredRaffles = raffles.filter(raffle => {
    if (typeFilter === 'all') return true;
    return raffle.type === typeFilter;
  });

  const handleTypeFilterChange = (filterType: 'all' | 'raffle' | 'fundraising') => {
    setTypeFilter(filterType);
  };

  const handleQuantityChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 100) {
      setTicketQuantity(numValue);
    }
  };

  const incrementQuantity = () => {
    if (ticketQuantity < 100) {
      setTicketQuantity(ticketQuantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (ticketQuantity > 1) {
      setTicketQuantity(ticketQuantity - 1);
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
          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button
              onClick={() => handleTypeFilterChange('all')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                typeFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50'
              }`}
            >
              All ({raffles.length})
            </button>
            <button
              onClick={() => handleTypeFilterChange('raffle')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                typeFilter === 'raffle'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50'
              }`}
            >
              Raffles ({raffles.filter(r => r.type === 'raffle').length})
            </button>
            <button
              onClick={() => handleTypeFilterChange('fundraising')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                typeFilter === 'fundraising'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50'
              }`}
            >
              Fundraising ({raffles.filter(r => r.type === 'fundraising').length})
            </button>
          </div>

          {filteredRaffles.length === 0 ? (
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md text-center">
              <p className="text-gray-500 text-lg">
                {typeFilter === 'all' 
                  ? 'No active raffles or fundraising campaigns at the moment.' 
                  : `No active ${typeFilter === 'raffle' ? 'raffles' : 'fundraising campaigns'} at the moment.`
                }
              </p>
              <p className="text-gray-400 mt-2">Check back soon for new opportunities!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {filteredRaffles.map((raffle) => (
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
                {selectedRaffle.type === 'raffle' ? 'Purchase Tickets' : 'Make a Donation'}
              </h2>
            </div>
            
            {purchaseSuccess && (
              <div className="mb-4 p-4 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg">
                {purchaseSuccess}
              </div>
            )}
            
            {purchaseError && (
              <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg">
                {purchaseError}
              </div>
            )}
            
            {selectedRaffle.type === 'fundraising' ? (
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
                <div>
                  <label htmlFor="ticket-quantity" className="block text-lg font-medium text-slate-600 mb-3">
                    Number of Tickets
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={decrementQuantity}
                      disabled={purchasing || ticketQuantity <= 1}
                      className="flex items-center justify-center w-12 h-12 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-lg font-bold text-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      −
                    </button>
                    <input
                      id="ticket-quantity"
                      type="number"
                      min="1"
                      max="100"
                      value={ticketQuantity}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                      className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg text-center font-medium"
                      disabled={purchasing}
                    />
                    <button
                      type="button"
                      onClick={incrementQuantity}
                      disabled={purchasing || ticketQuantity >= 100}
                      className="flex items-center justify-center w-12 h-12 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-lg font-bold text-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">
                    {ticketQuantity} ticket{ticketQuantity !== 1 ? 's' : ''} selected (max 100)
                  </p>
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

      {/* Payment Processing Modal */}
      <PaymentProcessingModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setCurrentPaymentId(null);
          localStorage.removeItem('pendingPaymentId');
        }}
        paymentId={currentPaymentId || ''}
        onPaymentComplete={handlePaymentComplete}
        onPaymentFailed={handlePaymentFailed}
      />

             {/* Payment Success Alert */}
       <PaymentSuccessAlert
         isVisible={showPaymentSuccessAlert}
         onClose={() => {
           setShowPaymentSuccessAlert(false);
           setPaymentSuccessDetails(null);
           setPurchaseSuccess(null);
           setShowPaymentModal(false);
         }}
         paymentDetails={paymentSuccessDetails}
       />
    </>
  );
};

export default PublicRaffles;
