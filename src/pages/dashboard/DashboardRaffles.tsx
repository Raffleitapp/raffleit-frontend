import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../constants/constants";
import { useAuth } from '../../context/authUtils'; // Import user context

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

export function Raffles() {
  const { user } = useAuth(); // Access user from context
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRaffle, setNewRaffle] = useState({
    title: "",
    description: "",
    starting_date: "",
    ending_date: "",
    // Add other fields as needed
  });

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
          : data.filter((raffle: Raffle) => raffle.hostName === `${user?.first_name} ${user?.last_name}`); // Users see their own raffles

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
      alert("Failed to create raffle.");
    }
  };

  if (loading) return <div>Loading raffles...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Manage Raffles</h1>
      <p>Create and manage your raffles here.</p>
      <button
        className="mb-4 px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700"
        onClick={() => setShowCreateModal(true)}
      >
        Create Raffle
      </button>

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
              value={newRaffle.starting_date}
              onChange={e => setNewRaffle({ ...newRaffle, starting_date: e.target.value })}
            />
            <input
              type="date"
              className="w-full mb-2 p-2 border rounded"
              value={newRaffle.ending_date}
              onChange={e => setNewRaffle({ ...newRaffle, ending_date: e.target.value })}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {raffles.map((raffle) => (
          <div key={raffle.id} className="bg-white rounded shadow p-4">
            <img src={raffle.image} alt={raffle.title} className="w-full h-40 object-cover rounded mb-2" />
            <h2 className="font-bold text-lg">{raffle.title}</h2>
            <p>{raffle.description}</p>
            <p className="text-sm text-gray-600">Ends: {raffle.endDate}</p>
          </div>
        ))}
      </div>
    </div>
  );
}