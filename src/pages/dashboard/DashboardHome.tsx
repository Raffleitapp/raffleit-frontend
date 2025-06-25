import { useAuth } from '../../context/authUtils';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../constants/constants';

interface RaffleStats {
  myActiveRaffles: number;
  ticketsPurchased: number;
  upcomingDraws: number;
  recentActivity: string[];
}

interface Raffle {
  approve_status: string;
  ending_date: string;
  title?: string;
  host_name?: string;
}

interface Ticket {
  id: string;
  raffle_id: string;
  user_id: string;
  purchase_date: string;
  // Add other fields as needed based on your API response
}

export const DashboardHome = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<RaffleStats>({
    myActiveRaffles: 0,
    ticketsPurchased: 0,
    upcomingDraws: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      if (!user?.user_id || !token) return;
      setLoading(true);
      try {
        // Fetch user's raffles
        const rafflesRes = await fetch(`${API_BASE_URL}/users/${user.user_id}/raffles`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const raffles: Raffle[] = rafflesRes.ok ? await rafflesRes.json() : [];

        // Fetch user's tickets
        const ticketsRes = await fetch(`${API_BASE_URL}/users/${user.user_id}/tickets`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const tickets: Ticket[] = ticketsRes.ok ? await ticketsRes.json() : [];
        const ticketsPurchased = tickets.length;

        // Calculate my active raffles
        const myActiveRaffles = raffles.filter(
          (r: Raffle) => r.approve_status === 'approved' && new Date(r.ending_date) > new Date()
        ).length;

        // Calculate upcoming draws
        const now = new Date();
        const in7Days = new Date();
        in7Days.setDate(now.getDate() + 7);
        const upcomingDraws = raffles.filter((r: Raffle) => {
          const end = new Date(r.ending_date);
          return end > now && end <= in7Days;
        }).length;

        // Recent activity
        const recentActivity: string[] = [];
        if (raffles.length > 0) {
          raffles.slice(0, 3).forEach((r: Raffle) => {
            recentActivity.push(`Your raffle '${r.title || r.host_name}' was ${r.approve_status}.`);
          });
        }

        setStats({
          myActiveRaffles,
          ticketsPurchased,
          upcomingDraws,
          recentActivity: recentActivity.slice(0, 3),
        });
      } catch {
        setStats({
          myActiveRaffles: 0,
          ticketsPurchased: 0,
          upcomingDraws: 0,
          recentActivity: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const userRoleDisplay = user?.role === 'admin' ? 'Admin' :
    user?.role === 'host' ? 'Host' : 'User';

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-4 text-gray-900">
        Welcome to Your Dashboard, {user?.first_name || userRoleDisplay}!
      </h1>
      <p className="text-lg text-gray-700 mb-8">
        Here's a quick overview of your Raffleit platform activity.
      </p>

      {/* Quick Stats/KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">My Active Raffles</h2>
          <p className="text-4xl font-bold text-blue-700">
            {loading ? '...' : stats.myActiveRaffles}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Tickets Purchased</h2>
          <p className="text-4xl font-bold text-green-600">
            {loading ? '...' : stats.ticketsPurchased}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Upcoming Draws</h2>
          <p className="text-4xl font-bold text-purple-700">
            {loading ? '...' : stats.upcomingDraws}
          </p>
        </div>
      </div>

      {/* Recent Activity/Updates */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : stats.recentActivity.length === 0 ? (
          <div className="text-gray-500">No recent activity found.</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {stats.recentActivity.map((activity, idx) => (
              <li key={idx} className="py-3 text-gray-700">{activity}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};