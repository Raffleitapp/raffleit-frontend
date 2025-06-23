import { useEffect, useState } from "react";
import { Hero } from "../components/main/Hero";
import { API_BASE_URL } from "../constants/constants";

interface Raffle {
  id: number;
  title: string;
  amount: number;
  endsIn: string;
  date: string;
  image: string;
  organization: string;
  targetAmount: number;
  hostName: string;
  startDate: string;
  endDate: string;
  description: string;
}

export const Raffles = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null);
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRaffle, setNewRaffle] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    // Add other fields as needed
  });
  const itemsPerPage = 3;

  useEffect(() => {
    const fetchRaffles = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/raffles`);
        if (!res.ok) throw new Error("Failed to fetch raffles");
        const data = await res.json();
        setRaffles(data);
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
        body: JSON.stringify(newRaffle),
      });
      if (!res.ok) throw new Error("Failed to create raffle");
      setShowCreateModal(false);
      // Optionally, refresh raffles list
    } catch {
      alert("Failed to create raffle.");
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
          <div className="raffle-details p-6 border rounded shadow-md bg-white">
            <button
              onClick={() => setSelectedRaffle(null)}
              className="mb-4 text-blue-500 underline"
            >
              Back to Raffles
            </button>
            <img
              src={selectedRaffle.image}
              alt={selectedRaffle.title}
              className="w-full h-60 object-cover rounded mb-4"
            />
            <h2 className="text-2xl font-bold mb-2">{selectedRaffle.title}</h2>
            <p><strong>Organization:</strong> {selectedRaffle.organization}</p>
            <p><strong>Target Amount:</strong> ${selectedRaffle.targetAmount}</p>
            <p><strong>Host Name:</strong> {selectedRaffle.hostName}</p>
            <p><strong>Start Date:</strong> {selectedRaffle.startDate}</p>
            <p><strong>End Date:</strong> {selectedRaffle.endDate}</p>
            <p className="mt-4">{selectedRaffle.description}</p>
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
              {paginatedRaffles.map((raffle) => (
                <div
                  key={raffle.id}
                  className="raffle-item border rounded shadow-md w-full cursor-pointer"
                  onClick={() => setSelectedRaffle(raffle)}
                >
                  <img
                    src={raffle.image}
                    alt={raffle.title}
                    className="w-full h-40 object-cover rounded mb-4"
                  />
                  <div className="p-4">
                    <h3 className="font-bold text-lg">{raffle.title}</h3>
                    <p>Amount Collected: ${raffle.amount}</p>
                    <p>Ends In: <span>{raffle.endsIn}</span></p>
                  </div>
                </div>
              ))}
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
              <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                  <h2 className="text-xl font-bold mb-4">Create New Raffle</h2>
                  <input
                    className="w-full mb-2 p-2 border rounded"
                    placeholder="Title"
                    value={newRaffle.title}
                    onChange={e => setNewRaffle({ ...newRaffle, title: e.target.value })}
                  />
                  <textarea
                    className="w-full mb-2 p-2 border rounded"
                    placeholder="Description"
                    value={newRaffle.description}
                    onChange={e => setNewRaffle({ ...newRaffle, description: e.target.value })}
                  />
                  <input
                    type="date"
                    className="w-full mb-2 p-2 border rounded"
                    value={newRaffle.startDate}
                    onChange={e => setNewRaffle({ ...newRaffle, startDate: e.target.value })}
                  />
                  <input
                    type="date"
                    className="w-full mb-2 p-2 border rounded"
                    value={newRaffle.endDate}
                    onChange={e => setNewRaffle({ ...newRaffle, endDate: e.target.value })}
                  />
                  {/* Add more fields as needed */}
                  <div className="flex justify-end gap-2">
                    <button
                      className="px-4 py-2 bg-gray-300 rounded"
                      onClick={() => setShowCreateModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded"
                      onClick={handleCreateRaffle}
                    >
                      Create
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
