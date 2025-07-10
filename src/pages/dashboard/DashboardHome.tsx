import { useAuth } from '../../context/authUtils';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../constants/constants';
import { Activity, BarChart3, FileText, Plus, Ticket, Users, TrendingUp, Calendar, Gift } from 'lucide-react';

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
        // Fetch user's raffles and tickets in parallel
        const [rafflesRes, ticketsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/users/${user.user_id}/raffles`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          fetch(`${API_BASE_URL}/users/${user.user_id}/tickets`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        ]);

        const raffles: Raffle[] = rafflesRes.ok ? await rafflesRes.json() : [];
        const tickets: Ticket[] = ticketsRes.ok ? await ticketsRes.json() : [];

        // Calculate statistics
        const myActiveRaffles = raffles.filter(
          (r: Raffle) => r.approve_status === 'approved' && new Date(r.ending_date) > new Date()
        ).length;

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
          ticketsPurchased: tickets.length,
          upcomingDraws,
          recentActivity: recentActivity.slice(0, 3),
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Welcome back, {user?.first_name || userRoleDisplay}!
              </h1>
              <p className="mt-2 text-lg text-slate-600">
                Here's what's happening with your Funditzone account
              </p>
            </div>
            <div className="hidden sm:flex items-center space-x-3">
              <div className="flex items-center px-3 py-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                <Users className="w-4 h-4 mr-1" />
                {userRoleDisplay}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Gift className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-500">My Active Raffles</p>
                <p className="text-2xl font-bold text-slate-800">
                  {loading ? '...' : stats.myActiveRaffles}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Ticket className="h-8 w-8 text-emerald-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-500">Tickets Purchased</p>
                <p className="text-2xl font-bold text-slate-800">
                  {loading ? '...' : stats.ticketsPurchased}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-500">Upcoming Draws</p>
                <p className="text-2xl font-bold text-slate-800">
                  {loading ? '...' : stats.upcomingDraws}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
              <div className="p-6">
                <h3 className="text-lg font-medium text-slate-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    to="/dashboard/raffles"
                    className="flex items-center w-full px-4 py-3 text-left text-sm font-medium text-slate-700 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
                  >
                    <Plus className="w-4 h-4 mr-3 text-slate-400" />
                    Create New Raffle
                  </Link>
                  
                  <Link
                    to="/raffles"
                    className="flex items-center w-full px-4 py-3 text-left text-sm font-medium text-slate-700 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
                  >
                    <Ticket className="w-4 h-4 mr-3 text-slate-400" />
                    Browse Raffles
                  </Link>

                  <Link
                    to="/dashboard/tickets"
                    className="flex items-center w-full px-4 py-3 text-left text-sm font-medium text-slate-700 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
                  >
                    <Activity className="w-4 h-4 mr-3 text-slate-400" />
                    My Tickets
                  </Link>

                  {user?.role === 'admin' && (
                    <>
                      <Link
                        to="/dashboard/analytics"
                        className="flex items-center w-full px-4 py-3 text-left text-sm font-medium text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-colors border border-blue-200"
                      >
                        <BarChart3 className="w-4 h-4 mr-3 text-blue-500" />
                        Admin Analytics
                      </Link>
                      
                      <Link
                        to="/dashboard/reports"
                        className="flex items-center w-full px-4 py-3 text-left text-sm font-medium text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-colors border border-blue-200"
                      >
                        <FileText className="w-4 h-4 mr-3 text-blue-500" />
                        Platform Reports
                      </Link>

                      <Link
                        to="/dashboard/users"
                        className="flex items-center w-full px-4 py-3 text-left text-sm font-medium text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-colors border border-blue-200"
                      >
                        <Users className="w-4 h-4 mr-3 text-blue-500" />
                        Manage Users
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
              <div className="p-6">
                <h3 className="text-lg font-medium text-slate-800 mb-4">Recent Activity</h3>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
                  </div>
                ) : stats.recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500">No recent activity to display</p>
                    <p className="text-sm text-slate-400 mt-1">Start by creating a raffle or purchasing tickets</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats.recentActivity.map((activity, idx) => (
                      <div key={idx} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex-shrink-0">
                          <Activity className="h-5 w-5 text-slate-400 mt-0.5" />
                        </div>
                        <p className="text-sm text-slate-700">{activity}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Admin Overview Section */}
        {user?.role === 'admin' && (
          <div className="mt-8">
            <div className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg shadow-lg text-white border border-slate-300">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Admin Dashboard</h3>
                    <p className="text-slate-100 mt-1">Access advanced analytics and platform management tools</p>
                  </div>
                  <div className="flex space-x-3">
                    <Link
                      to="/dashboard/analytics"
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors border border-white border-opacity-20"
                    >
                      Analytics
                    </Link>
                    <Link
                      to="/dashboard/reports"
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors border border-white border-opacity-20"
                    >
                      Reports
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};