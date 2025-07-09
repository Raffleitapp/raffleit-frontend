import { useEffect, useState } from "react";
import { Hero } from "../components/main/Hero";
import { API_BASE_URL } from "../constants/constants";
import RaffleCard, { Raffle as RaffleCardType } from "../components/shared/RaffleCard";

// This is the data structure from the API
interface ApiRaffle {
  id: number;
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
  category?: {
    id: number;
    category_name: string;
  };
}

export const Raffles = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRaffle, setSelectedRaffle] = useState<ApiRaffle | null>(null);
  const [raffles, setRaffles] = useState<ApiRaffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchRaffles = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/raffles`);
        if (!res.ok) throw new Error("Failed to fetch raffles");
        const data = await res.json();
        
        const now = new Date();
        const liveRaffles = data.filter((raffle: ApiRaffle) => 
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
      filterDate ? raffle.starting_date.startsWith(filterDate) : true
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
                  src={selectedRaffle.image1_url || '/images/default-raffle.png'}
                  alt={selectedRaffle.title}
                  className="w-full h-64 object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/default-raffle.png';
                  }}
                />
              </div>
              <div className="md:w-1/2">
                <h2 className="text-3xl font-bold mb-2">{selectedRaffle.title}</h2>
                <p className="text-gray-600 mb-4">Hosted by: {selectedRaffle.host_name}</p>
                <p className="text-gray-700 mb-4">{selectedRaffle.description}</p>
                
                {selectedRaffle.type === 'raffle' ? (
                  <div className="mb-4">
                    <p>Ticket Price: <span className="font-semibold">${selectedRaffle.ticket_price}</span></p>
                    <p>Tickets Sold: <span className="font-semibold">{selectedRaffle.calculated_tickets_sold ?? selectedRaffle.tickets_sold ?? 0} / {selectedRaffle.max_tickets}</span></p>
                  </div>
                ) : (
                  <div className="mb-4">
                    <p>Raised: <span className="font-semibold">${selectedRaffle.current_amount ?? 0} of ${selectedRaffle.target}</span></p>
                  </div>
                )}

                <div className="text-sm text-gray-500">
                  <p>Starts: {new Date(selectedRaffle.starting_date).toLocaleString()}</p>
                  <p>Ends: {new Date(selectedRaffle.ending_date).toLocaleString()}</p>
                </div>

                <button className="mt-6 w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors">
                  Enter Now
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-center space-x-4 mb-8">
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="p-2 border rounded-lg"
              />
              <input
                type="date"
                value={filterDate}
                onChange={handleDateChange}
                className="p-2 border rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
              {paginatedRaffles.map((raffle) => {
                const cardProps: RaffleCardType = {
                  id: raffle.id,
                  title: raffle.title,
                  hostName: raffle.host_name,
                  endDate: raffle.ending_date,
                  type: raffle.type,
                  approveStatus: raffle.approve_status,
                  imageUrl: raffle.image1_url || '/images/default-raffle.png',
                  category: raffle.category?.category_name || 'N/A',
                  ticketPrice: raffle.ticket_price,
                  totalTickets: raffle.max_tickets,
                  currentTickets: raffle.calculated_tickets_sold ?? raffle.tickets_sold,
                  target: raffle.target,
                  currentAmount: raffle.current_amount,
                };
                return (
                  <RaffleCard 
                    key={raffle.id}
                    raffle={cardProps}
                    onViewDetails={() => setSelectedRaffle(raffle)}
                  />
                )
              })}
            </div>

            <div className="flex justify-center mt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 mx-1 rounded-lg ${
                      currentPage === page
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};
