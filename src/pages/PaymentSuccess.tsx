import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import paddleService from '../utils/paddleService';

interface Payment {
  id: string;
  amount: string;
  currency: string;
  status: string;
  payment_type: string;
  quantity: number;
  raffle: {
    id: string;
    title: string;
  };
}

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const paymentId = searchParams.get('payment_id');

  const loadPaymentDetails = useCallback(async () => {
    if (!paymentId) return;

    try {
      setLoading(true);
      const result = await paddleService.getPayment(paymentId);
      
      if (result.success && result.payment) {
        setPayment(result.payment);
      } else {
        setError(result.error || 'Failed to load payment details');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [paymentId]);

  useEffect(() => {
    if (paymentId) {
      loadPaymentDetails();
    } else {
      setError('No payment ID provided');
      setLoading(false);
    }
  }, [paymentId, loadPaymentDetails]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Processing Payment</h2>
          <p className="text-gray-600">Please wait while we confirm your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-red-600 mb-2">Payment Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/raffles"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Raffles
          </Link>
        </div>
      </div>
    );
  }

  const isCompleted = payment?.status === 'completed';
  const isPending = payment?.status === 'pending';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
        {isCompleted ? (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 text-3xl">✓</span>
            </div>
            <h2 className="text-2xl font-semibold text-green-600 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your {payment.payment_type === 'ticket' ? 'ticket purchase' : 'donation'}!
            </p>
          </>
        ) : isPending ? (
          <>
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-yellow-600 text-3xl">⏳</span>
            </div>
            <h2 className="text-2xl font-semibold text-yellow-600 mb-2">Payment Processing</h2>
            <p className="text-gray-600 mb-6">
              Your payment is being processed. You'll receive a confirmation shortly.
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-600 text-3xl">📋</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">Payment Status</h2>
            <p className="text-gray-600 mb-6">
              Payment status: {payment?.status || 'Unknown'}
            </p>
          </>
        )}

        {payment && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
            <h3 className="font-semibold mb-2">Payment Details</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Raffle:</span>
                <span>{payment.raffle.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="capitalize">{payment.payment_type}</span>
              </div>
              {payment.payment_type === 'ticket' && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity:</span>
                  <span>{payment.quantity} ticket{payment.quantity > 1 ? 's' : ''}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold">
                <span className="text-gray-600">Amount:</span>
                <span>${parseFloat(payment.amount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-4">
          <Link
            to={payment ? `/raffles/${payment.raffle.id}` : '/raffles'}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Raffle
          </Link>
          <Link
            to="/dashboard/payments"
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Payment History
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
