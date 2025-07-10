import React, { useState, useEffect } from 'react';
import { Activity, CreditCard, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import apiClient from '../../utils/apiClient';

interface PaymentMethod {
  method: string;
  total_transactions: number;
  total_revenue: string;
  success_rate: number;
  avg_processing_time: string;
}

interface TransactionTrend {
  date: string;
  transactions: number;
  revenue: number;
}

interface PaymentAnalyticsData {
  total_transactions: number;
  total_revenue: number;
  payment_methods: Record<string, number>;
  transaction_trends: TransactionTrend[];
  payment_status_breakdown: Record<string, number>;
  hourly_trends: Record<string, number>;
}

interface PaymentAnalyticsChartProps {
  period?: string;
}

const PaymentAnalyticsChart: React.FC<PaymentAnalyticsChartProps> = ({ period = '30d' }) => {
  const [analyticsData, setAnalyticsData] = useState<PaymentAnalyticsData | null>(null);
  const [methodPerformance, setMethodPerformance] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'trends' | 'methods' | 'status' | 'hourly'>('trends');

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    try {
      const [analyticsRes, methodsRes] = await Promise.all([
        apiClient.get(`/admin/analytics/payments?period=${period}`),
        apiClient.get(`/admin/analytics/payment-methods?period=${period}`),
      ]);

      setAnalyticsData(analyticsRes.data.data);
      setMethodPerformance(methodsRes.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [period]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Prepare data for displays
  const preparePaymentMethodData = () => {
    if (!analyticsData) return [];
    
    return Object.entries(analyticsData.payment_methods).map(([method, count]) => ({
      name: method.charAt(0).toUpperCase() + method.slice(1),
      value: count,
      percentage: ((count / analyticsData.total_transactions) * 100).toFixed(1),
    }));
  };

  const prepareStatusData = () => {
    if (!analyticsData) return [];
    
    return Object.entries(analyticsData.payment_status_breakdown).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      percentage: ((count / analyticsData.total_transactions) * 100).toFixed(1),
    }));
  };

  const prepareTrendsData = () => {
    if (!analyticsData?.transaction_trends) return [];
    
    return analyticsData.transaction_trends.map(trend => ({
      date: new Date(trend.date).toLocaleDateString(),
      transactions: trend.transactions,
      revenue: trend.revenue,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <Activity className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-800">Error: {error}</span>
        </div>
      </div>
    );
  }

  const paymentMethodData = preparePaymentMethodData();
  const statusData = prepareStatusData();
  const trendsData = prepareTrendsData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Payment Analytics</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'trends'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <TrendingUp className="w-4 h-4 mr-2 inline" />
            Trends
          </button>
          <button
            onClick={() => setActiveTab('methods')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'methods'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <CreditCard className="w-4 h-4 mr-2 inline" />
            Methods
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'status'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <PieChartIcon className="w-4 h-4 mr-2 inline" />
            Status
          </button>
        </div>
      </div>

      {/* Analytics Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {activeTab === 'trends' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Trends</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendsData.slice(0, 12).map((trend, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">{trend.date}</div>
                  <div className="text-lg font-semibold text-gray-900">{trend.transactions} transactions</div>
                  <div className="text-sm text-green-600">{formatCurrency(trend.revenue)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'methods' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payment Method Distribution */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Distribution</h4>
                <div className="space-y-3">
                  {paymentMethodData.map((method, index) => (
                    <div key={method.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded mr-3 ${index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-green-500' : 'bg-purple-500'}`}></div>
                        <span className="font-medium">{method.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{method.value}</div>
                        <div className="text-sm text-gray-500">{method.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Method Performance */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Performance</h4>
                <div className="space-y-4">
                  {methodPerformance.map((method) => (
                    <div key={method.method} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium capitalize">{method.method}</span>
                        <span className="text-sm text-gray-500">{method.success_rate}% success</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>{method.total_transactions} transactions • ${method.total_revenue}</p>
                        <p>Avg. processing: {method.avg_processing_time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'status' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {statusData.map((status) => (
                <div key={status.name} className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">{status.name}</div>
                  <div className="text-2xl font-bold text-blue-600">{status.value}</div>
                  <div className="text-sm text-gray-500">{status.percentage}% of total</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentAnalyticsChart; 