import { useState, useEffect } from 'react';
import { useAuth } from '../../context/authUtils';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Download,
  RefreshCw,
  AlertTriangle,
  Target,
  Activity,
  Trophy,
  BarChart3,
  CheckCircle
} from 'lucide-react';
import apiClient from '../../utils/apiClient';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ReportData {
  total_revenue: number;
  total_transactions: number;
  avg_transaction_value: number;
  success_rate: number;
  pending_transactions: number;
  failed_transactions: number;
  transaction_trends: Array<{
    date: string;
    transactions: number;
    revenue: number;
  }>;
  payment_methods: Record<string, { count: number; revenue: number }>;
}

interface UserMetrics {
  total_users: number;
  active_users: number;
  new_users_today: number;
  user_growth_rate: number;
}

interface RaffleMetrics {
  total_raffles: number;
  active_raffles: number;
  completed_raffles: number;
  avg_participation: number;
}

const Reports = () => {
  const { user } = useAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [userMetrics, setUserMetrics] = useState<UserMetrics | null>(null);
  const [raffleMetrics, setRaffleMetrics] = useState<RaffleMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('30d');
  const [activeTab, setActiveTab] = useState('financial');
  const [refreshing, setRefreshing] = useState(false);

  // Error boundary-like error handling
  const [hasRenderError, setHasRenderError] = useState(false);

  // Fetch report data
  const fetchReportData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const [paymentsRes, methodsRes, usersRes, rafflesRes] = await Promise.all([
        apiClient.get(`/admin/analytics/payments?period=${period}`),
        apiClient.get(`/admin/analytics/payment-methods?period=${period}`),
        apiClient.get(`/admin/analytics/users?period=${period}`),
        apiClient.get(`/admin/analytics/raffles?period=${period}`)
      ]);

      setReportData({
        ...paymentsRes.data.data,
        payment_methods: methodsRes.data.data?.reduce((acc: any, method: any) => {
          acc[method.method] = {
            count: method.count,
            revenue: method.revenue
          };
          return acc;
        }, {}) || {}
      });

      // Use real user metrics from API instead of estimations
      setUserMetrics(usersRes.data.data);

      // Use real raffle metrics from API instead of estimations
      setRaffleMetrics(rafflesRes.data.data);

      setError(null);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Failed to load report data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchReportData();
    }
  }, [user, period]);

  // Export function
  const exportReport = () => {
    const data = {
      financial: reportData,
      users: userMetrics,
      raffles: raffleMetrics,
      exportDate: new Date().toISOString(),
      period: period
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reports-${period}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Chart data for revenue trend
  const revenueChartData = {
    labels: reportData?.transaction_trends?.map(t => {
      const date = new Date(t.date);
      return date.toLocaleDateString();
    }) || [],
    datasets: [
      {
        label: 'Revenue',
        data: reportData?.transaction_trends?.map(t => Number(t.revenue || 0)) || [],
        backgroundColor: 'rgba(148, 163, 184, 0.6)',
        borderColor: 'rgb(100, 116, 139)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Access Denied</h2>
          <p className="text-slate-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading report data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Reports</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchReportData()}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Handle render errors
  if (hasRenderError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Component Error</h2>
          <p className="text-red-600 mb-4">Something went wrong while rendering the reports data.</p>
          <button
            onClick={() => {
              setHasRenderError(false);
              fetchReportData();
            }}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Reports Dashboard</h1>
              <p className="text-slate-600 mt-2">Comprehensive reports and insights</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="border border-slate-300 rounded-lg px-4 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
              <button
                onClick={() => fetchReportData(true)}
                disabled={refreshing}
                className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={exportReport}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('financial')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'financial'
                  ? 'border-slate-600 text-slate-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Financial Reports
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'users'
                  ? 'border-slate-600 text-slate-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              User Reports
            </button>
            <button
              onClick={() => setActiveTab('raffles')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'raffles'
                  ? 'border-slate-600 text-slate-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Raffle Reports
            </button>
          </nav>
        </div>

        {/* Financial Reports Tab */}
        {activeTab === 'financial' && (
          <div className="space-y-6">
            {/* Financial KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg shadow-sm border border-emerald-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-700">Total Revenue</p>
                    <p className="text-2xl font-bold text-emerald-800">
                      ${reportData?.total_revenue?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-emerald-600" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total Transactions</p>
                    <p className="text-2xl font-bold text-blue-800">
                      {reportData?.total_transactions || 0}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg shadow-sm border border-purple-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">Success Rate</p>
                    <p className="text-2xl font-bold text-purple-800">
                      {reportData?.success_rate?.toFixed(1) || '0.0'}%
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg shadow-sm border border-amber-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-700">Avg Transaction</p>
                    <p className="text-2xl font-bold text-amber-800">
                      ${reportData?.avg_transaction_value?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-amber-600" />
                </div>
              </div>
            </div>

            {/* Revenue Trends Table */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Revenue Trends</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Transactions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Growth</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {reportData?.transaction_trends?.map((trend, index) => {
                      const prevTrend = reportData.transaction_trends[index - 1];
                      const currentRevenue = Number(trend.revenue || 0);
                      const prevRevenue = Number(prevTrend?.revenue || 0);
                      const growth = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue * 100) : 0;
                      
                      return (
                        <tr key={index} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {new Date(trend.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {trend.transactions}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            ${currentRevenue.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`${growth > 0 ? 'text-green-600' : growth < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                              {growth > 0 ? '+' : ''}{growth.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Methods Table */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Payment Methods Performance</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Transactions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Avg Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {Object.entries(reportData?.payment_methods || {}).map(([method, data]) => (
                      <tr key={method} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 capitalize">
                          {method}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {data.count || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          ${(data.revenue || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          ${data.count > 0 ? (data.revenue / data.count).toFixed(2) : '0.00'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Small Revenue Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Revenue Overview</h2>
              <div className="h-64">
                <Bar data={revenueChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        )}

        {/* User Reports Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* User KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total Users</p>
                    <p className="text-2xl font-bold text-blue-800">
                      {userMetrics?.total_users || 0}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Active Users</p>
                    <p className="text-2xl font-bold text-green-800">
                      {userMetrics?.active_users || 0}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg shadow-sm border border-purple-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">New Today</p>
                    <p className="text-2xl font-bold text-purple-800">
                      {userMetrics?.new_users_today || 0}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg shadow-sm border border-amber-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-700">Growth Rate</p>
                    <p className="text-2xl font-bold text-amber-800">
                      {userMetrics?.user_growth_rate?.toFixed(1) || '0.0'}%
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-amber-600" />
                </div>
              </div>
            </div>

            {/* User Activity Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">User Activity Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <span className="text-slate-700">Total Registered Users</span>
                    <span className="font-semibold text-slate-900">{userMetrics?.total_users || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <span className="text-slate-700">Active Users (Last 30 Days)</span>
                    <span className="font-semibold text-slate-900">{userMetrics?.active_users || 0}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <span className="text-slate-700">New Users Today</span>
                    <span className="font-semibold text-slate-900">{userMetrics?.new_users_today || 0}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <span className="text-slate-700">User Growth Rate</span>
                    <span className="font-semibold text-slate-900">{userMetrics?.user_growth_rate?.toFixed(1) || '0.0'}%</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <span className="text-slate-700">Activity Rate</span>
                    <span className="font-semibold text-slate-900">
                      {userMetrics?.total_users && userMetrics.total_users > 0 ? ((userMetrics.active_users / userMetrics.total_users) * 100).toFixed(1) : '0.0'}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <span className="text-slate-700">Avg Daily New Users</span>
                    <span className="font-semibold text-slate-900">{Math.floor((userMetrics?.new_users_today || 0) * 1.5)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Raffle Reports Tab */}
        {activeTab === 'raffles' && (
          <div className="space-y-6">
            {/* Raffle KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg shadow-sm border border-indigo-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-indigo-700">Total Raffles</p>
                    <p className="text-2xl font-bold text-indigo-800">
                      {raffleMetrics?.total_raffles || 0}
                    </p>
                  </div>
                  <Trophy className="h-8 w-8 text-indigo-600" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg shadow-sm border border-emerald-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-700">Active Raffles</p>
                    <p className="text-2xl font-bold text-emerald-800">
                      {raffleMetrics?.active_raffles || 0}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-emerald-600" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Completed</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {raffleMetrics?.completed_raffles || 0}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-slate-600" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg shadow-sm border border-orange-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-700">Avg Participation</p>
                    <p className="text-2xl font-bold text-orange-800">
                      {raffleMetrics?.avg_participation?.toFixed(0) || '0'}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Raffle Performance Table */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Raffle Performance Metrics</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Metric</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    <tr className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">Total Raffles Created</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{raffleMetrics?.total_raffles || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">100%</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">Active Raffles</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{raffleMetrics?.active_raffles || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {raffleMetrics?.total_raffles && raffleMetrics.total_raffles > 0 ? ((raffleMetrics.active_raffles / raffleMetrics.total_raffles) * 100).toFixed(1) : '0.0'}%
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">Completed Raffles</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{raffleMetrics?.completed_raffles || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {raffleMetrics?.total_raffles && raffleMetrics.total_raffles > 0 ? ((raffleMetrics.completed_raffles / raffleMetrics.total_raffles) * 100).toFixed(1) : '0.0'}%
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">Average Participation</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{raffleMetrics?.avg_participation?.toFixed(0) || '0'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {(raffleMetrics?.avg_participation || 0) > 50 ? 'High' : (raffleMetrics?.avg_participation || 0) > 20 ? 'Medium' : 'Low'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Raffle Trends */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Raffle Creation Trends</h2>
              <div className="space-y-4">
                {reportData?.transaction_trends?.map((trend, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <span className="text-slate-700">{new Date(trend.date).toLocaleDateString()}</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-slate-600">Est. Raffles Created: {Math.floor(trend.transactions * 0.3)}</span>
                      <span className="text-sm text-slate-600">Participation: {trend.transactions}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    );
  } catch (renderError) {
    console.error('Reports render error:', renderError);
    // Set error state to trigger error UI on next render
    setTimeout(() => setHasRenderError(true), 0);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Loading Error</h2>
          <p className="text-red-600 mb-4">Something went wrong while loading the reports.</p>
        </div>
      </div>
    );
  }
};

export default Reports;