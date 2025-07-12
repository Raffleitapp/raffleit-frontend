import React, { useState, useEffect } from 'react';


interface PaymentHistoryItem {
  id: string;
  amount: string;
  currency: string;
  status: string;
  payment_type: string;
  quantity: number;
  created_at: string;
  raffle: {
    id: string;
    title: string;
  };
}

const PaymentHistory: React.FC = () => {
  const [payments] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(1);

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  const loadPaymentHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Implement payment history with PayPal or other payment provider
      setError('Payment history feature is currently unavailable');
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      refunded: 'bg-blue-100 text-blue-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentTypeIcon = (type: string) => {
    if (type === 'ticket') {
      return (
        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 text-sm font-medium">🎫</span>
        </div>
      );
    } else {
      return (
        <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <span className="text-green-600 text-sm font-medium">💝</span>
        </div>
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex space-x-4 mb-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="text-center text-red-600">
          <p className="mb-4">{error}</p>
          <button
            onClick={loadPaymentHistory}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-900">Payment History</h2>
        <p className="text-gray-600 mt-1">View your past transactions and donations</p>
      </div>

      {payments.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          <p>No payments found.</p>
          <p className="text-sm mt-1">Your payment history will appear here once you make a purchase or donation.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {payments.map((payment) => (
            <div key={payment.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start space-x-4">
                {getPaymentTypeIcon(payment.payment_type)}
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900">
                      {payment.payment_type === 'ticket' ? (
                        `${payment.quantity} Ticket${payment.quantity > 1 ? 's' : ''}`
                      ) : (
                        'Donation'
                      )}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(payment.status)}
                      <span className="text-lg font-semibold text-gray-900">
                        ${parseFloat(payment.amount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-1">{payment.raffle.title}</p>
                  <p className="text-xs text-gray-500">{formatDate(payment.created_at)}</p>
                  
                  {payment.payment_type === 'ticket' && (
                    <p className="text-xs text-gray-500 mt-1">
                      ${(parseFloat(payment.amount) / payment.quantity).toFixed(2)} per ticket
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
