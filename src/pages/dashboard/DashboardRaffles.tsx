import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../constants/constants";
import { useAuth } from '../../context/authUtils';
import RaffleCard, { Raffle as RaffleCardData } from '../../components/shared/RaffleCard';
import RaffleDetailsModal from '../../components/shared/RaffleDetailsModal';
import PaymentOptions from '../../components/shared/PaymentOptions';

interface ApiRaffle {
  id: number;
  share_id?: string;
  title: string;
  host_name: string;
  description: string;
  target: number;
  starting_date: string;
  ending_date: string;
  approve_status: 'approved' | 'pending' | 'rejected';
  type: 'raffle' | 'fundraising';
  ticket_price?: number;
  max_tickets?: number;
  tickets_sold?: number;
  calculated_tickets_sold?: number;
  current_amount?: number;
  image1_url?: string;
  images?: Array<{
    id: number;
    path: string;
    url: string;
  }>;
  category?: {
    id: number;
    category_name: string;
  };
}

export function Raffles() {
  const { user } = useAuth();
  const [raffles, setRaffles] = useState<ApiRaffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRaffle, setSelectedRaffle] = useState<ApiRaffle | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [donationAmount, setDonationAmount] = useState<string>('');
  const [donationMode, setDonationMode] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);
  const [newRaffle, setNewRaffle] = useState({
    title: "",
    description: "",
    starting_date: "",
    ending_date: "",
    type: "raffle" as "raffle" | "fundraising",
    ticket_price: "",
    max_tickets: "",
    target: "",
  });

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

  const [timeLeft, setTimeLeft] = useState<{[key: number]: ReturnType<typeof calculateTimeLeft>}>({});

  useEffect(() => {
    // Initial calculation
    const initialTimeLeft: {[key: number]: ReturnType<typeof calculateTimeLeft>} = {};
    raffles.forEach(raffle => {
      initialTimeLeft[raffle.id] = calculateTimeLeft(raffle.ending_date);
    });
    setTimeLeft(initialTimeLeft);

    // Set up timer to update every second
    const timer = setInterval(() => {
      const newTimeLeft: {[key: number]: ReturnType<typeof calculateTimeLeft>} = {};
      raffles.forEach(raffle => {
        newTimeLeft[raffle.id] = calculateTimeLeft(raffle.ending_date);
      });
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [raffles]);

  useEffect(() => {
    const fetchRaffles = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/raffles`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch raffles");
        const data = await res.json();

        const filteredRaffles = user?.role === 'admin'
          ? data
          : data.filter((raffle: ApiRaffle) => raffle.host_name === `${user?.first_name} ${user?.last_name}`);

        setRaffles(filteredRaffles);
      } catch {
        setError("Failed to load raffles.");
      } finally {
        setLoading(false);
      }
    };
    fetchRaffles();
  }, [user?.first_name, user?.last_name, user?.role]); // Add necessary dependencies

  const handleCreateRaffle = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/raffles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newRaffle,
          approve_status: 'approved', // Automatically approve raffles
        }),
      });
      if (!res.ok) throw new Error("Failed to create raffle");
      setShowCreateModal(false);
      // Optionally, refresh raffles list
    } catch {
      setError("Failed to create raffle. Please try again.");
    }
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedRaffle(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedRaffle?.images && currentImageIndex < selectedRaffle.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const openDetailsModal = (raffle: ApiRaffle) => {
    setSelectedRaffle(raffle);
    setShowDetailsModal(true);
    setTicketQuantity(1);
    setDonationAmount('');
    setDonationMode(raffle.type === 'fundraising');
    setPurchaseError(null);
    setPurchaseSuccess(null);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
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
    const amount = isDonation ? parseFloat(donationAmount) : (selectedRaffle.ticket_price || 0) * ticketQuantity;
    
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

  const convertToRaffleCardData = (raffle: ApiRaffle): RaffleCardData => {
    return {
      id: raffle.id,
      share_id: raffle.share_id || `raffle-${raffle.id}`,
      title: raffle.title,
      prize: raffle.description,
      description: raffle.description,
      hostName: raffle.host_name,
      currentTickets: raffle.calculated_tickets_sold || raffle.tickets_sold || 0,
      totalTickets: raffle.max_tickets || 0,
      endDate: raffle.ending_date,
      ticketPrice: raffle.ticket_price || 0,
      imageUrl: raffle.image1_url || '/images/tb2.png',
      images: raffle.images,
      category: raffle.category?.category_name || 'N/A',
      target: raffle.target,
      type: raffle.type,
      currentAmount: raffle.current_amount || 0,
      status: raffle.approve_status === 'approved' ? 'active' : 'pending',
      approveStatus: raffle.approve_status,
    };
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

  if (loading) return (
    <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="text-lg text-gray-700">Loading raffles...</div>
    </div>
  );
  
  if (error) return (
    <div className="p-6 bg-gray-100 min-h-screen text-red-600 text-center">
      <div className="text-lg font-semibold">Error</div>
      <div>{error}</div>
    </div>
  );

  const mappedRaffles: RaffleCardData[] = raffles.map(raffle => ({
    id: raffle.id,
    share_id: raffle.share_id || `raffle-${raffle.id}`,
    title: raffle.title,
    hostName: raffle.host_name,
    endDate: raffle.ending_date,
    imageUrl: raffle.image1_url || (raffle.images && raffle.images.length > 0 ? raffle.images[0].url : '/images/default-raffle.png'),
    category: raffle.category?.category_name || 'N/A',
    type: raffle.type,
    approveStatus: raffle.approve_status,
    ticketPrice: raffle.ticket_price,
    currentTickets: raffle.tickets_sold,
    totalTickets: raffle.max_tickets,
    currentAmount: raffle.current_amount,
    target: raffle.target,
  }));

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">My Raffles</h1>
          <p className="text-lg text-gray-700 mt-2">Create and manage your raffles here.</p>
        </div>
        <button
          className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
          onClick={() => setShowCreateModal(true)}
        >
          + Create New Raffle
        </button>
      </div>

      {raffles.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No raffles yet</h3>
          <p className="text-gray-600 mb-6">Start by creating your first raffle to engage your community!</p>
          <button
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => setShowCreateModal(true)}
          >
            Create Your First Raffle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {mappedRaffles.map((raffle) => {
            const originalRaffle = raffles.find(r => r.id === raffle.id);
            return (
              <RaffleCard
                key={raffle.id}
                raffle={raffle}
                onViewDetails={() => originalRaffle && openDetailsModal(originalRaffle)}
                onShare={handleShare}
                timeLeft={timeLeft[raffle.id]}
              >
                <div className="flex gap-2">
                  <button
                    onClick={() => originalRaffle && openDetailsModal(originalRaffle)}
                    className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    View Details
                  </button>
                  <button className="flex-1 bg-slate-200 text-slate-800 px-3 py-2 rounded hover:bg-slate-300 text-sm font-medium">
                    Edit
                  </button>
                </div>
              </RaffleCard>
            );
          })}
        </div>
      )}

      {/* Create Raffle Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Create New Campaign</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleCreateRaffle(); }}>
              {/* Type Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className={`p-3 border rounded-lg text-center transition-all ${
                      newRaffle.type === 'raffle' 
                        ? 'border-purple-500 bg-purple-50 text-purple-700' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setNewRaffle({ ...newRaffle, type: 'raffle' })}
                  >
                    <div className="font-medium">Raffle</div>
                    <div className="text-xs text-gray-600">Sell tickets for prizes</div>
                  </button>
                  <button
                    type="button"
                    className={`p-3 border rounded-lg text-center transition-all ${
                      newRaffle.type === 'fundraising' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setNewRaffle({ ...newRaffle, type: 'fundraising' })}
                  >
                    <div className="font-medium">Fundraising</div>
                    <div className="text-xs text-gray-600">Accept donations</div>
                  </button>
                </div>
              </div>

              <input
                className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={newRaffle.type === 'raffle' ? 'Raffle Title' : 'Fundraising Campaign Title'}
                value={newRaffle.title}
                onChange={e => setNewRaffle({ ...newRaffle, title: e.target.value })}
                required
              />
              <textarea
                className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder={newRaffle.type === 'raffle' ? 'Describe the prize and raffle details' : 'Describe your fundraising cause'}
                value={newRaffle.description}
                onChange={e => setNewRaffle({ ...newRaffle, description: e.target.value })}
                rows={3}
              />

              {/* Target Amount */}
              <input
                type="number"
                className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={newRaffle.type === 'raffle' ? 'Target Amount ($)' : 'Fundraising Goal ($)'}
                value={newRaffle.target}
                onChange={e => setNewRaffle({ ...newRaffle, target: e.target.value })}
                min="1"
                required
              />

              {/* Raffle-specific fields */}
              {newRaffle.type === 'raffle' && (
                <div className="space-y-4 mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      step="0.01"
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ticket Price ($)"
                      value={newRaffle.ticket_price}
                      onChange={e => setNewRaffle({ ...newRaffle, ticket_price: e.target.value })}
                      min="0.01"
                      required
                    />
                    <input
                      type="number"
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Max Tickets (optional)"
                      value={newRaffle.max_tickets}
                      onChange={e => setNewRaffle({ ...newRaffle, max_tickets: e.target.value })}
                      min="1"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                <input
                  type="date"
                  className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Start Date"
                  value={newRaffle.starting_date}
                  onChange={e => setNewRaffle({ ...newRaffle, starting_date: e.target.value })}
                  required
                />
                <input
                  type="date"
                  className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="End Date"
                  value={newRaffle.ending_date}
                  onChange={e => setNewRaffle({ ...newRaffle, ending_date: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Raffle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && selectedRaffle && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-900 bg-opacity-50 flex items-center justify-center z-50" onClick={closeImageModal}>
          <div className="relative max-w-4xl max-h-full p-4" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={closeImageModal}
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75 z-10 text-xl"
            >
              ✕
            </button>

            {/* Main Image */}
            {selectedRaffle.images && selectedRaffle.images.length > 0 && (
              <img
                src={selectedRaffle.images[currentImageIndex]?.url}
                alt={`${selectedRaffle.title} - Image ${currentImageIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/default-raffle.png';
                }}
              />
            )}

            {/* Navigation Arrows */}
            {selectedRaffle.images && selectedRaffle.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  disabled={currentImageIndex === 0}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center hover:bg-opacity-75 disabled:opacity-30 disabled:cursor-not-allowed text-2xl"
                >
                  &#8249;
                </button>
                <button
                  onClick={nextImage}
                  disabled={currentImageIndex === selectedRaffle.images.length - 1}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center hover:bg-opacity-75 disabled:opacity-30 disabled:cursor-not-allowed text-2xl"
                >
                  &#8250;
                </button>
              </>
            )}

            {/* Image Counter and Info */}
            {selectedRaffle.images && selectedRaffle.images.length > 0 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg text-center">
                <div className="text-sm font-medium">{selectedRaffle.title}</div>
                <div className="text-xs opacity-90">
                  Image {currentImageIndex + 1} of {selectedRaffle.images.length}
                </div>
              </div>
            )}

            {/* Thumbnails */}
            {selectedRaffle.images && selectedRaffle.images.length > 1 && (
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4">
                {selectedRaffle.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex 
                        ? 'border-white scale-110' 
                        : 'border-transparent opacity-70 hover:opacity-90'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/default-raffle.png';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Raffle Details Modal */}
      {selectedRaffle && (
        <RaffleDetailsModal
          raffle={convertToRaffleCardData(selectedRaffle)}
          isOpen={showDetailsModal}
          onClose={closeDetailsModal}
          onShare={handleShare}
          isDashboard={true}
        >
          {/* Dashboard Payment Section */}
          <div className="border-t pt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-slate-800">
                {selectedRaffle.type === 'raffle' ? 'Purchase Tickets or Donate' : 'Make a Donation'}
              </h2>
              {selectedRaffle.type === 'raffle' && (
                <div className="flex bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => setDonationMode(false)}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                      !donationMode 
                        ? 'bg-white text-indigo-600 shadow-sm' 
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    Buy Tickets
                  </button>
                  <button
                    onClick={() => setDonationMode(true)}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
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
              <div className="text-center p-6 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Join the Fun!</h3>
                <p className="mb-4">Please create an account or log in to {selectedRaffle.type === 'raffle' ? 'purchase tickets or donate' : 'make a donation'}</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => window.location.href = '/login'}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => window.location.href = '/register'}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
                  >
                    Sign Up
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
                  onCancel={() => setSelectedRaffle(null)}
                  disabled={!donationAmount || parseFloat(donationAmount) <= 0}
                  purchasing={purchasing}
                  isDashboard={true}
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
                    ${typeof selectedRaffle.ticket_price === 'number' ? (selectedRaffle.ticket_price * ticketQuantity).toFixed(2) : 'N/A'}
                  </span>
                </div>

                <PaymentOptions
                  onPayPalClick={() => handlePayment('paypal')}
                  onCancel={() => setSelectedRaffle(null)}
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
}