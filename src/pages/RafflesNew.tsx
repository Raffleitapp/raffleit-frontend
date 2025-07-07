import { useEffect, useState } from "react";
import { Hero } from "../components/main/Hero";
import { RaffleCard } from "../components/main/RaffleCard";
import { FilterSearch } from "../components/main/FilterSearch";
import RafflePaymentExample from "../components/payments/RafflePaymentExample";
import { API_BASE_URL } from "../constants/constants";
import { ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";

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
  image1_url?: string;
  state_raffle_hosted?: string;
  category?: {
    id: number;
    category_name: string;
  };
}

interface Category {
  id: number;
  category_name: string;
}

export const Raffles = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const rafflesPerPage = 12;

  // Fetch raffles from API
  const fetchRaffles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/raffles`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch raffles');
      }
      
      const data = await response.json();
      setRaffles(data.raffles || []);
      
      // Extract unique categories and locations
      const uniqueCategories = Array.from(
        new Map(data.raffles
          ?.filter((raffle: Raffle) => raffle.category)
          .map((raffle: Raffle) => [raffle.category!.id, raffle.category])
        ).values()
      ) as Category[];
      
      const uniqueLocations = Array.from(
        new Set(data.raffles
          ?.filter((raffle: Raffle) => raffle.state_raffle_hosted)
          .map((raffle: Raffle) => raffle.state_raffle_hosted)
        )
      ) as string[];
      
      setCategories(uniqueCategories);
      setLocations(uniqueLocations);
    } catch (error) {
      console.error('Error fetching raffles:', error);
      setError('Failed to load raffles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRaffles();
  }, []);

  // Filter and sort raffles
  const filteredRaffles = raffles.filter((raffle) => {
    const matchesSearch = raffle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         raffle.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         raffle.host_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !filterCategory || raffle.category?.category_name === filterCategory;
    const matchesType = !filterType || raffle.type === filterType;
    const matchesLocation = !filterLocation || raffle.state_raffle_hosted === filterLocation;
    const matchesPrice = !raffle.ticket_price || 
                        (raffle.ticket_price >= priceRange[0] && raffle.ticket_price <= priceRange[1]);
    
    return matchesSearch && matchesCategory && matchesType && matchesLocation && matchesPrice;
  });

  // Sort raffles
  const sortedRaffles = [...filteredRaffles].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.starting_date).getTime() - new Date(a.starting_date).getTime();
      case 'ending_soon':
        return new Date(a.ending_date).getTime() - new Date(b.ending_date).getTime();
      case 'price_low':
        return (a.ticket_price || 0) - (b.ticket_price || 0);
      case 'price_high':
        return (b.ticket_price || 0) - (a.ticket_price || 0);
      case 'popular':
        return (b.tickets_sold || 0) - (a.tickets_sold || 0);
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedRaffles.length / rafflesPerPage);
  const startIndex = (currentPage - 1) * rafflesPerPage;
  const paginatedRaffles = sortedRaffles.slice(startIndex, startIndex + rafflesPerPage);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handleRaffleSelect = (raffle: Raffle) => {
    setSelectedRaffle(raffle);
  };

  const handlePurchase = (raffle: Raffle) => {
    setSelectedRaffle(raffle);
    setShowPaymentModal(true);
  };

  const closeModal = () => {
    setSelectedRaffle(null);
    setShowPaymentModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Hero backgroundImage="/images/home-bg.png" />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading raffles...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Hero backgroundImage="/images/home-bg.png" />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="text-red-600 text-lg mb-4">{error}</div>
            <button
              onClick={fetchRaffles}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Hero backgroundImage="/images/home-bg.png" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Filter and Search */}
        <FilterSearch
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          filterType={filterType}
          setFilterType={setFilterType}
          filterLocation={filterLocation}
          setFilterLocation={setFilterLocation}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          sortBy={sortBy}
          setSortBy={setSortBy}
          viewMode={viewMode}
          setViewMode={setViewMode}
          categories={categories}
          locations={locations}
          totalCount={sortedRaffles.length}
        />

        {/* Raffles Grid */}
        {paginatedRaffles.length > 0 ? (
          <>
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {paginatedRaffles.map((raffle) => (
                <RaffleCard
                  key={raffle.id}
                  raffle={raffle}
                  onSelect={handleRaffleSelect}
                  onPurchase={handlePurchase}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center mt-8 space-x-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </button>
                
                <span className="flex items-center px-4 py-2 text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="text-gray-500 text-lg mb-4">No raffles found</div>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Raffle Detail Modal */}
      {selectedRaffle && !showPaymentModal && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-sm transition-opacity flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Raffle Details</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold mb-2">{selectedRaffle.title}</h3>
                <p className="text-gray-600 mb-4">{selectedRaffle.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Host:</strong> {selectedRaffle.host_name}
                  </div>
                  <div>
                    <strong>Type:</strong> {selectedRaffle.type}
                  </div>
                  <div>
                    <strong>Category:</strong> {selectedRaffle.category?.category_name || 'N/A'}
                  </div>
                  <div>
                    <strong>Location:</strong> {selectedRaffle.state_raffle_hosted || 'N/A'}
                  </div>
                  {selectedRaffle.ticket_price && (
                    <div>
                      <strong>Ticket Price:</strong> ${selectedRaffle.ticket_price}
                    </div>
                  )}
                  <div>
                    <strong>Target:</strong> ${selectedRaffle.target}
                  </div>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {selectedRaffle.type === 'fundraising' ? 'Donate Now' : 'Buy Tickets'}
                  </button>
                  <button
                    onClick={closeModal}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedRaffle && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-sm transition-opacity flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedRaffle.type === 'fundraising' ? 'Make a Donation' : 'Purchase Tickets'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <RafflePaymentExample
                raffle={{
                  id: selectedRaffle.id.toString(),
                  title: selectedRaffle.title,
                  ticket_price: selectedRaffle.ticket_price || 0,
                  description: selectedRaffle.description,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
