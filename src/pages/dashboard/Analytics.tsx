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
  Activity, 
  CreditCard,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Target
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

interface AnalyticsData {
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
  payment_methods: Record<string, number>;
  hourly_trends: Record<string, number>;
}

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  count: number;
  timestamp: string;
}

interface Transaction {
  id: string | number;
  user_id: string | number;
  amount: number;
  status: string;
  payment_method?: string;
  created_at: string;
  processing_time?: number;
}

const Analytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('24h');
  const [refreshing, setRefreshing] = useState(false);

  // Error boundary-like error handling
  const [hasRenderError, setHasRenderError] = useState(false);

  // Fetch analytics data
  const fetchAnalytics = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const [analyticsRes, transactionsRes, alertsRes] = await Promise.all([
        apiClient.get(`/admin/analytics/payments?period=${period}`),
        apiClient.get(`/admin/analytics/transactions/realtime?limit=10`),
        apiClient.get(`/admin/analytics/alerts`)
      ]);

      setAnalytics(analyticsRes.data.data);
      setTransactions(transactionsRes.data.data || []);
      setAlerts(alertsRes.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAnalytics();
    }
  }, [user, period]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (user?.role === 'admin') {
      const interval = setInterval(() => {
        fetchAnalytics(true);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user, period]);

  // Chart configuration for revenue trend only
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

  // Revenue trend chart data (only one chart)
  const revenueChartData = {
    labels: analytics?.transaction_trends?.map(t => {
      const date = new Date(t.date);
      return date.toLocaleDateString();
    }) || [],
    datasets: [
      {
        label: 'Revenue',
        data: analytics?.transaction_trends?.map(t => Number(t.revenue || 0)) || [],
        backgroundColor: 'rgba(148, 163, 184, 0.6)',
        borderColor: 'rgb(100, 116, 139)',
        borderWidth: 1,
      },
    ],
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
          <p className="text-slate-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Analytics</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchAnalytics()}
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
          <p className="text-red-600 mb-4">Something went wrong while rendering the analytics data.</p>
          <button
            onClick={() => {
              setHasRenderError(false);
              fetchAnalytics();
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
              <h1 className="text-3xl font-bold text-slate-800">Analytics Dashboard</h1>
              <p className="text-slate-600 mt-2">Monitor your system's performance and metrics</p>
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
                onClick={() => fetchAnalytics(true)}
                disabled={refreshing}
                className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                <p className="text-2xl font-bold text-slate-800">
                  ${analytics?.total_revenue?.toFixed(2) || '0.00'}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Transactions</p>
                <p className="text-2xl font-bold text-slate-800">
                  {analytics?.total_transactions || 0}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Success Rate</p>
                <p className="text-2xl font-bold text-slate-800">
                  {analytics?.success_rate?.toFixed(1) || '0.0'}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg Transaction</p>
                <p className="text-2xl font-bold text-slate-800">
                  ${analytics?.avg_transaction_value?.toFixed(2) || '0.00'}
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transaction Trends Table */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Transaction Trends</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Transactions</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Avg Per Transaction</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {analytics?.transaction_trends?.map((trend, index) => (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                        {new Date(trend.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                        {trend.transactions}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                        ${typeof trend.revenue === 'number' ? trend.revenue.toFixed(2) : Number(trend.revenue || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                        ${trend.transactions > 0 ? (Number(trend.revenue || 0) / trend.transactions).toFixed(2) : '0.00'}
                      </td>
                    </tr>
                  ))}
                  {(!analytics?.transaction_trends || analytics.transaction_trends.length === 0) && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                        No transaction data available for the selected period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Methods Table */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Payment Methods</h2>
            <div className="space-y-4">
              {Object.entries(analytics?.payment_methods || {}).map(([method, count]) => (
                <div key={method} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-slate-600" />
                    <span className="text-sm font-medium text-slate-700 capitalize">{method}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{count}</span>
                </div>
              ))}
              {(!analytics?.payment_methods || Object.keys(analytics.payment_methods).length === 0) && (
                <div className="text-center py-8 text-slate-500">
                  No payment method data available
                </div>
              )}
            </div>
          </div>

          {/* Recent Transactions Table */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Recent Transactions</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Method</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-slate-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                        #{String(transaction.id).slice(-8)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                        ${typeof transaction.amount === 'number' ? transaction.amount.toFixed(2) : Number(transaction.amount || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900 capitalize">
                        {transaction.payment_method || 'N/A'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                        No recent transactions available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Revenue Trend Chart (Only chart) */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Revenue Trend</h2>
            <div className="h-64">
              <Bar data={revenueChartData} options={chartOptions} />
            </div>
          </div>

          {/* System Alerts Table */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">System Alerts</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Message</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Count</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {alerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-slate-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          alert.type === 'error' ? 'bg-red-100 text-red-800' :
                          alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {alert.type}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-900">
                        {alert.message}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                        {alert.count}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                        {new Date(alert.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {alerts.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                        No system alerts at this time
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  } catch (renderError) {
    console.error('Analytics render error:', renderError);
    // Set error state to trigger error UI on next render
    setTimeout(() => setHasRenderError(true), 0);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Loading Error</h2>
          <p className="text-red-600 mb-4">Something went wrong while loading the analytics.</p>
        </div>
      </div>
    );
  }
};

export default Analytics;