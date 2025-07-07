import { useEffect, useState } from "react";
import { Hero } from "../components/main/Hero";
import { RaffleCard } from "../components/main/RaffleCard";
import { FilterSearch } from "../components/main/FilterSearch";
import { RafflePaymentExample } from "../components/payments/RafflePaymentExample";
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
  const [totalCount, setTotalCount] = useState(0);

  const rafflesPerPage = 12;
  const itemsPerPage = 3;

  useEffect(() => {
    const fetchRaffles = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/raffles`);
        if (!res.ok) throw new Error("Failed to fetch raffles");
        const data = await res.json();
        
        // Filter for only approved and live raffles
        const now = new Date();
        const liveRaffles = data.filter((raffle: Raffle) => 
          raffle.approve_status === 'approved' && 
          new Date(raffle.ending_date) > now
        );
        
        setRaffles(liveRaffles);
      } catch {
        setError("Failed to load raffles.");
      } finally {
        setLoading(false);
      }
    };
    fetchRaffles();
  }, []);

  const filteredRaffles = raffles
    .filter((raffle) =>
      raffle.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((raffle) =>
      filterDate ? raffle.date === filterDate : true
    );

  const totalPages = Math.ceil(filteredRaffles.length / itemsPerPage);
  const paginatedRaffles = filteredRaffles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterDate(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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

  if (loading) return <div>Loading raffles...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <>
      <Hero backgroundImage="./images/home-bg.png" title="Join Live Raffles" />
      <div className="container mx-auto py-4 px-4">
        <div className="text-center md:mt-10 mt-10 mb-4 w-full md:w-70/100 mx-auto">
          <h1 className="font-bold text-text-primary">LIVE RAFFLES</h1>
          <h2 className="text-4xl mt-2 font-bold mb-4">
            Join Live Raffles and Win Amazing Prizes!
          </h2>
        </div>
        {selectedRaffle ? (
          <div className="raffle-details p-6 border rounded-lg shadow-lg bg-white max-w-4xl mx-auto">
            <button
              onClick={() => setSelectedRaffle(null)}
              className="mb-4 text-blue-500 underline hover:text-blue-700"
            >
              ← Back to Raffles
            </button>
            
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2">
                <img
                  src={selectedRaffle.image1_url || selectedRaffle.image || '/images/default-raffle.png'}
                  alt={selectedRaffle.title}
                  className="w-full h-64 object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/default-raffle.png';
                  }}
                />
              </div>
              
              <div className="md:w-1/2">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold">{selectedRaffle.title}</h1>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    selectedRaffle.type === 'raffle' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedRaffle.type === 'raffle' ? '🎟️ Raffle' : '💝 Fundraising'}
                  </span>
                </div>
                
                <div className="space-y-3 mb-4">
                  <p><strong>Host:</strong> {selectedRaffle.host_name}</p>
                  {selectedRaffle.category && (
                    <p><strong>Category:</strong> {selectedRaffle.category.category_name}</p>
                  )}
                  <p><strong>Target Amount:</strong> ${selectedRaffle.target?.toLocaleString()}</p>
                  <p><strong>End Date:</strong> {new Date(selectedRaffle.ending_date).toLocaleDateString()}</p>
                  
                  {selectedRaffle.type === 'raffle' ? (
                    <>
                      {selectedRaffle.ticket_price && (
                        <p><strong>Ticket Price:</strong> ${selectedRaffle.ticket_price}</p>
                      )}
                      <p><strong>Tickets Sold:</strong> {selectedRaffle.calculated_tickets_sold ?? selectedRaffle.tickets_sold ?? 0}
                        {selectedRaffle.max_tickets && ` / ${selectedRaffle.max_tickets}`}
                      </p>
                    </>
                  ) : (
                    <p><strong>Amount Raised:</strong> ${(selectedRaffle.current_amount ?? 0).toLocaleString()}</p>
                  )}
                </div>
                
                {selectedRaffle.description && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-gray-700">{selectedRaffle.description}</p>
                  </div>
                )}
                
                <div className="mt-6">
                  <button className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                    {selectedRaffle.type === 'raffle' ? 'Buy Tickets' : 'Make Donation'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-text-primary rounded py-4 px-4 mt-4 mb-4 flex justify-between items-center">
              <h2 className="text-white text-lg font-bold">
                Search Raffles
              </h2>
              <p className="text-white">
                Use filters to refine your search
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <input
                type="text"
                placeholder="Search raffles..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="border p-2 rounded w-full md:w-1/2"
              />
              <input
                type="date"
                value={filterDate}
                onChange={handleDateChange}
                className="border p-2 rounded w-full md:w-1/2"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center gap-4">
              {paginatedRaffles.map((raffle) => {
                const daysLeft = Math.ceil((new Date(raffle.ending_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                const imageUrl = raffle.image1_url || raffle.image || '/images/default-raffle.png';
                
                return (
                  <div
                    key={raffle.id}
                    className="raffle-item border rounded-lg shadow-md w-full cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedRaffle(raffle)}
                  >
                    <div className="relative">
                      <img
                        src={imageUrl}
                        alt={raffle.title}
                        className="w-full h-40 object-cover rounded-t-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/default-raffle.png';
                        }}
                      />
                      {/* Days left badge */}
                      <div className="absolute top-2 right-2">
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
                          {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2 line-clamp-2">{raffle.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">Host: {raffle.host_name}</p>
                      
                      {raffle.category && (
                        <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block mb-2">
                          {raffle.category.category_name}
                        </p>
                      )}
                      
                      <div className="space-y-1">
                        {raffle.type === 'raffle' ? (
                          <>
                            {raffle.ticket_price && (
                              <p className="text-sm">
                                <span className="text-green-600 font-medium">Ticket Price:</span> 
                                <span className="font-semibold ml-1">${raffle.ticket_price}</span>
                              </p>
                            )}
                            <p className="text-sm">
                              <span className="text-purple-600 font-medium">Tickets Sold:</span> 
                              <span className="font-semibold ml-1">
                                {raffle.calculated_tickets_sold ?? raffle.tickets_sold ?? 0}
                                {raffle.max_tickets && ` / ${raffle.max_tickets}`}
                              </span>
                            </p>
                          </>
                        ) : (
                          <p className="text-sm">
                            <span className="text-blue-600 font-medium">Amount Raised:</span> 
                            <span className="font-semibold ml-1">${(raffle.current_amount ?? 0).toLocaleString()}</span>
                          </p>
                        )}
                        <p className="text-sm">
                          <span className="text-gray-600">Target:</span> 
                          <span className="font-semibold ml-1">${raffle.target?.toLocaleString()}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center mt-6">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-4 py-2 mx-1 border rounded ${currentPage === index + 1
                    ? "bg-blue-500 text-white"
                    : "bg-white text-blue-500"
                    }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <div className="flex justify-end mb-4">
              <button
                className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700"
                onClick={() => setShowCreateModal(true)}
              >
                Create Raffle
              </button>
            </div>
            {showCreateModal && (
              <div className="fixed inset-0 bg-white/10 backdrop-blur-sm transition-opacity flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                  <h2 className="text-2xl font-bold mb-6">Create New Campaign</h2>
                  
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
                        <div className="text-lg mb-1">🎟️</div>
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
                        <div className="text-lg mb-1">💝</div>
                        <div className="font-medium">Fundraising</div>
                        <div className="text-xs text-gray-600">Accept donations</div>
                      </button>
                    </div>
                  </div>

                  <input
                    className="w-full mb-4 p-3 border border-gray-300 rounded-lg"
                    placeholder={newRaffle.type === 'raffle' ? 'Raffle Title' : 'Fundraising Campaign Title'}
                    value={newRaffle.title}
                    onChange={e => setNewRaffle({ ...newRaffle, title: e.target.value })}
                    required
                  />
                  
                  <input
                    className="w-full mb-4 p-3 border border-gray-300 rounded-lg"
                    placeholder="Host Name"
                    value={newRaffle.host_name}
                    onChange={e => setNewRaffle({ ...newRaffle, host_name: e.target.value })}
                    required
                  />
                  
                  <textarea
                    className="w-full mb-4 p-3 border border-gray-300 rounded-lg resize-none"
                    placeholder={newRaffle.type === 'raffle' ? 'Describe the prize and raffle details' : 'Describe your fundraising cause'}
                    value={newRaffle.description}
                    onChange={e => setNewRaffle({ ...newRaffle, description: e.target.value })}
                    rows={3}
                  />

                  {/* Target Amount */}
                  <input
                    type="number"
                    className="w-full mb-4 p-3 border border-gray-300 rounded-lg"
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
                          className="p-3 border border-gray-300 rounded-lg"
                          placeholder="Ticket Price ($)"
                          value={newRaffle.ticket_price}
                          onChange={e => setNewRaffle({ ...newRaffle, ticket_price: e.target.value })}
                          min="0.01"
                          required
                        />
                        <input
                          type="number"
                          className="p-3 border border-gray-300 rounded-lg"
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
                      className="p-3 border border-gray-300 rounded-lg"
                      placeholder="Start Date"
                      value={newRaffle.starting_date}
                      onChange={e => setNewRaffle({ ...newRaffle, starting_date: e.target.value })}
                      required
                    />
                    <input
                      type="date"
                      className="p-3 border border-gray-300 rounded-lg"
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
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      onClick={handleCreateRaffle}
                    >
                      Create {newRaffle.type === 'raffle' ? 'Raffle' : 'Campaign'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};
