import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../constants/constants";

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
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) return <div>Loading raffles...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Manage Raffles</h1>
      <p>Create and manage your raffles here.</p>
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