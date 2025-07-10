import React, { useEffect, useState, useCallback } from 'react';
import { Gift, CheckCircle, Clock, Trophy, DollarSign, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../../constants/constants';
import { useAuth } from '../../context/authUtils';

interface RaffleAnalytics {
  total_raffles: number;
  active_raffles: number;
  pending_raffles: number;
  completed_raffles: number;
  approved_raffles?: number;
  total_revenue: number;
  recent_raffles: Array<{
    id: number;
    title: string;
    host_name: string;
    approve_status: string;
    type: string;
    tickets_sold: number;
    current_amount: number;
    target?: number;
    ticket_price?: number;
    ending_date: string;
    created_at: string;
    category_name: string;
  }>;
  top_performing_raffles: Array<{
    id: number;
    title: string;
    host_name: string;
    type: string;
    tickets_sold: number;
    current_amount: number;
    target?: number;
    ticket_price?: number;
    ending_date: string;
    category_name: string;
  }>;
}

interface UserRaffle {
  id: number;
  title: string;
  host_name: string;
  approve_status: string;
  type: string;
  tickets_sold: number;
  current_amount: number;
  target?: number;
  ticket_price?: number;
  ending_date: string;
  created_at: string;
}

interface Props {
  userRole: string;
  onRefresh?: () => void;
}

// Helper function to safely convert to number
const safeToNumber = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }
  return 0;
};

export const RaffleAnalyticsComponent: React.FC<Props> = ({ userRole, onRefresh }) => {
  const { user } = useAuth();
  const [raffleAnalytics, setRaffleAnalytics] = useState<RaffleAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchAdminRaffleAnalytics = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token || userRole !== 'admin') return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/raffles/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Ensure all numbers are properly converted
        setRaffleAnalytics({
          ...data,
          total_raffles: safeToNumber(data.total_raffles),
          active_raffles: safeToNumber(data.active_raffles),
          pending_raffles: safeToNumber(data.pending_raffles),
          completed_raffles: safeToNumber(data.completed_raffles),
          total_revenue: safeToNumber(data.total_revenue),
          recent_raffles: data.recent_raffles || [],
          top_performing_raffles: data.top_performing_raffles || []
        });
      } else {
        throw new Error(`Failed to fetch admin analytics: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching admin raffle analytics:', error);
      setError('Failed to load admin analytics');
    } finally {
      setLoading(false);
    }
  }, [userRole]);

  const fetchUserRaffleAnalytics = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token || !user?.user_id || userRole === 'admin') return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/raffles/user-analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Ensure all numbers are properly converted
        setRaffleAnalytics({
          total_raffles: safeToNumber(data.total_raffles),
          active_raffles: safeToNumber(data.active_raffles),
          pending_raffles: safeToNumber(data.pending_raffles),
          completed_raffles: safeToNumber(data.completed_raffles),
          approved_raffles: safeToNumber(data.approved_raffles),
          total_revenue: safeToNumber(data.total_revenue),
          recent_raffles: (data.recent_raffles || []).map((raffle: any) => ({
            ...raffle,
            tickets_sold: safeToNumber(raffle.tickets_sold),
            current_amount: safeToNumber(raffle.current_amount)
          })),
          top_performing_raffles: (data.top_performing_raffles || []).map((raffle: any) => ({
            ...raffle,
            tickets_sold: safeToNumber(raffle.tickets_sold),
            current_amount: safeToNumber(raffle.current_amount)
          }))
        });
      } else {
        throw new Error(`Failed to fetch user analytics: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching user raffle analytics:', error);
      setError('Failed to load your raffle analytics');
    } finally {
      setLoading(false);
    }
  }, [userRole, user?.user_id]);

  const fetchRaffleAnalytics = useCallback(async () => {
    if (userRole === 'admin') {
      await fetchAdminRaffleAnalytics();
    } else {
      await fetchUserRaffleAnalytics();
    }
    setLastUpdate(new Date());
  }, [userRole, fetchAdminRaffleAnalytics, fetchUserRaffleAnalytics]);

  const handleRefresh = useCallback(async () => {
    await fetchRaffleAnalytics();
    if (onRefresh) onRefresh();
  }, [fetchRaffleAnalytics, onRefresh]);

  useEffect(() => {
    if (userRole && (userRole === 'admin' || user?.user_id)) {
      fetchRaffleAnalytics();
    }
  }, [fetchRaffleAnalytics, userRole, user?.user_id]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!userRole || (userRole !== 'admin' && !user?.user_id)) return;

    const interval = setInterval(() => {
      fetchRaffleAnalytics();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchRaffleAnalytics, userRole, user?.user_id]);

  if (error) {
    return (
      <div className="mb-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Analytics</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!raffleAnalytics) {
    return (
      <div className="mb-8">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg shadow-lg text-white p-6 mb-6">
          <h2 className="text-xl font-bold mb-2">
            {userRole === 'admin' ? 'Platform Raffle Analytics' : 'My Raffle Analytics'}
          </h2>
          <p className="text-purple-100">
            {userRole === 'admin' 
              ? 'Real-time raffle tracking and performance metrics' 
              : 'Track your raffle performance and statistics'
            }
          </p>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg shadow-lg text-white p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">
              {userRole === 'admin' ? 'Platform Raffle Analytics' : 'My Raffle Analytics'}
            </h2>
            <p className="text-purple-100">
              {userRole === 'admin' 
                ? 'Real-time raffle tracking and performance metrics' 
                : 'Track your raffle performance and statistics'
              }
            </p>
            <p className="text-xs text-purple-200 mt-1">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center px-3 py-2 bg-purple-500 hover:bg-purple-400 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Raffle Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Gift className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Total Raffles</p>
              <p className="text-2xl font-bold text-slate-800">{raffleAnalytics.total_raffles}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Active</p>
              <p className="text-2xl font-bold text-slate-800">{raffleAnalytics.active_raffles}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">
                {userRole === 'admin' ? 'Pending' : 'Pending Approval'}
              </p>
              <p className="text-2xl font-bold text-slate-800">{raffleAnalytics.pending_raffles}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Trophy className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">
                {userRole === 'admin' ? 'Completed' : 'Finished'}
              </p>
              <p className="text-2xl font-bold text-slate-800">{raffleAnalytics.completed_raffles}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">
                {userRole === 'admin' ? 'Total Revenue' : 'Total Raised'}
              </p>
              <p className="text-2xl font-bold text-slate-800">${safeToNumber(raffleAnalytics.total_revenue).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* User-specific stats for non-admin users */}
      {userRole !== 'admin' && raffleAnalytics.approved_raffles !== undefined && raffleAnalytics.total_raffles > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{raffleAnalytics.approved_raffles}</div>
              <div className="text-sm text-blue-700">Approved Raffles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {raffleAnalytics.total_raffles > 0 
                  ? ((raffleAnalytics.approved_raffles / raffleAnalytics.total_raffles) * 100).toFixed(1)
                  : '0'
                }%
              </div>
              <div className="text-sm text-green-700">Approval Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                ${raffleAnalytics.approved_raffles > 0 
                  ? (safeToNumber(raffleAnalytics.total_revenue) / raffleAnalytics.approved_raffles).toFixed(2)
                  : '0.00'
                }
              </div>
              <div className="text-sm text-purple-700">Avg. per Raffle</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Raffles and Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Raffles */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-medium text-slate-800 mb-4">
            {userRole === 'admin' ? 'Recent Raffles' : 'My Recent Raffles'}
          </h3>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : raffleAnalytics.recent_raffles.length === 0 ? (
            <p className="text-slate-500 text-center py-4">No recent raffles</p>
          ) : (
            <div className="space-y-3">
              {raffleAnalytics.recent_raffles.slice(0, 5).map((raffle) => (
                <div key={raffle.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center">
                    <Gift className="w-4 h-4 text-slate-400 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-slate-900 truncate max-w-32">
                        {raffle.title}
                      </div>
                      <div className="text-xs text-slate-500">
                        {raffle.host_name} • {raffle.type}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                      raffle.approve_status === 'approved' ? 'bg-green-100 text-green-800' :
                      raffle.approve_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {raffle.approve_status.toUpperCase()}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {safeToNumber(raffle.tickets_sold)} tickets
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Performing Raffles */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-medium text-slate-800 mb-4">
            {userRole === 'admin' ? 'Top Performing Raffles' : 'My Best Performers'}
          </h3>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : raffleAnalytics.top_performing_raffles.length === 0 ? (
            <p className="text-slate-500 text-center py-4">No performing raffles yet</p>
          ) : (
            <div className="space-y-3">
              {raffleAnalytics.top_performing_raffles.slice(0, 5).map((raffle, index) => (
                <div key={raffle.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900 truncate max-w-32">
                        {raffle.title}
                      </div>
                      <div className="text-xs text-slate-500">
                        {raffle.host_name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-900">
                      ${safeToNumber(raffle.current_amount).toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {safeToNumber(raffle.tickets_sold)} tickets
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 