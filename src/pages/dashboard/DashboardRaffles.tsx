import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../constants/constants";
import { useAuth } from '../../context/authUtils'; // Import user context

interface Raffle {
  id: number;
  title: string;
  host_name: string;
  description: string;
  target: number;
  starting_date: string;
  ending_date: string;
  approve_status: string;
  type: 'raffle' | 'fundraising';
  ticket_price?: number;
  max_tickets?: number;
  tickets_sold?: number;
  calculated_tickets_sold?: number;
  current_amount?: number;
  image1?: string;
  image2?: string;
  image3?: string;
  image4?: string;
  image1_url?: string;
  image2_url?: string;
  image3_url?: string;
  image4_url?: string;
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
  const { user } = useAuth(); // Access user from context
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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

  // Countdown timer state and effect
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

        // Filter raffles based on user role
        const filteredRaffles = user?.role === 'admin'
          ? data // Admins see all raffles
          : data.filter((raffle: Raffle) => raffle.host_name === `${user?.first_name} ${user?.last_name}`); // Users see their own raffles

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

  const openImageModal = (raffle: Raffle, imageIndex = 0) => {
    setSelectedRaffle(raffle);
    setCurrentImageIndex(imageIndex);
    setShowImageModal(true);
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

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <style dangerouslySetInnerHTML={{
        __html: `
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `
      }} />
      
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {raffles.map((raffle) => {
            // Get the primary image URL (first available image)
            const primaryImageUrl = raffle.image1_url || 
                                    (raffle.images && raffle.images.length > 0 ? raffle.images[0].url : null) ||
                                    '/images/default-raffle.png';

            return (
              <div key={raffle.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {/* Image Section */}
                <div className="relative cursor-pointer" onClick={() => openImageModal(raffle, 0)}>
                  <img 
                    src={primaryImageUrl} 
                    alt={raffle.title} 
                    className="w-full h-48 object-cover hover:opacity-90 transition-opacity"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/default-raffle.png';
                    }}
                  />
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      raffle.approve_status === 'approved' ? 'bg-green-100 text-green-800' :
                      raffle.approve_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {raffle.approve_status?.charAt(0).toUpperCase() + raffle.approve_status?.slice(1)}
                    </span>
                  </div>

                  {/* Additional Images Indicator */}
                  {raffle.images && raffle.images.length > 1 && (
                    <div className="absolute bottom-2 left-2">
                      <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                        {raffle.images.length} photos
                      </span>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="font-bold text-lg text-gray-900 line-clamp-2 flex-1">{raffle.title}</h2>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                      raffle.type === 'raffle' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {raffle.type === 'raffle' ? 'Raffle' : 'Fundraising'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Host: {raffle.host_name}</p>
                  
                  {raffle.description && (
                    <p className="text-gray-700 text-sm mb-3 line-clamp-2">{raffle.description}</p>
                  )}

                  {raffle.category && (
                    <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block mb-2">
                      {raffle.category.category_name}
                    </p>
                  )}

                  {/* Countdown Timer */}
                  <div className="mb-3">
                    {timeLeft[raffle.id] && timeLeft[raffle.id].total > 0 ? (
                      <div className="bg-red-50 p-2 rounded">
                        <p className="text-xs text-red-800 font-semibold mb-1">Time Remaining:</p>
                        <div className="flex gap-2 text-xs">
                          <span className="bg-red-100 px-1 rounded">{timeLeft[raffle.id].days}d</span>
                          <span className="bg-red-100 px-1 rounded">{timeLeft[raffle.id].hours}h</span>
                          <span className="bg-red-100 px-1 rounded">{timeLeft[raffle.id].minutes}m</span>
                          <span className="bg-red-100 px-1 rounded">{timeLeft[raffle.id].seconds}s</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-600 font-semibold">Campaign has ended</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Target: ${raffle.target?.toLocaleString()}</span>
                      <span>Ends: {new Date(raffle.ending_date).toLocaleDateString()}</span>
                    </div>
                    
                    {raffle.type === 'raffle' && (
                      <div className="space-y-1">
                        {raffle.ticket_price && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-green-600 font-medium">Ticket Price:</span>
                            <span className="font-semibold">${raffle.ticket_price}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-purple-600 font-medium">Tickets Sold:</span>
                          <span className="font-semibold">
                            {raffle.calculated_tickets_sold ?? raffle.tickets_sold ?? 0}
                            {raffle.max_tickets && ` / ${raffle.max_tickets}`}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {raffle.type === 'fundraising' && raffle.current_amount !== undefined && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-blue-600 font-medium">Raised:</span>
                        <span className="font-semibold">${raffle.current_amount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors text-sm font-medium">
                      View Details
                    </button>
                    <button className="flex-1 bg-gray-200 text-gray-800 px-3 py-2 rounded hover:bg-gray-300 transition-colors text-sm font-medium">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
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
      {showImageModal && selectedRaffle && selectedRaffle.images && selectedRaffle.images.length > 0 && (
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
            <img
              src={selectedRaffle.images[currentImageIndex]?.url}
              alt={`${selectedRaffle.title} - Image ${currentImageIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/default-raffle.png';
              }}
            />

            {/* Navigation Arrows */}
            {selectedRaffle.images.length > 1 && (
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
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg text-center">
              <div className="text-sm font-medium">{selectedRaffle.title}</div>
              <div className="text-xs opacity-90">
                Image {currentImageIndex + 1} of {selectedRaffle.images.length}
              </div>
            </div>

            {/* Thumbnails */}
            {selectedRaffle.images.length > 1 && (
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
    </div>
  );
}