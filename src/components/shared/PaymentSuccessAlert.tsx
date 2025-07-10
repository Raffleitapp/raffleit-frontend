import React, { useEffect, useState } from 'react';
import { CheckCircle, X, CreditCard, DollarSign } from 'lucide-react';

interface PaymentSuccessAlertProps {
  isVisible: boolean;
  onClose: () => void;
  paymentDetails?: {
    amount: number;
    paymentMethod: string;
    transactionId: string;
    raffleTitle?: string;
    ticketQuantity?: number;
  } | null;
}

const PaymentSuccessAlert: React.FC<PaymentSuccessAlertProps> = ({
  isVisible,
  onClose,
  paymentDetails
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16">
      <div 
        className={`bg-white rounded-lg shadow-2xl border border-green-200 p-6 mx-4 max-w-md w-full transform transition-all duration-300 ${
          show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800">Payment Successful!</h3>
              <p className="text-sm text-green-600">Your transaction has been completed</p>
            </div>
          </div>
          <button
            onClick={() => {
              setShow(false);
              setTimeout(onClose, 300);
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Payment Details */}
        {paymentDetails && (
          <div className="space-y-3 mb-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-700">Amount Paid:</span>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-lg font-bold text-green-800">
                      ${(paymentDetails.amount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-700">Payment Method:</span>
                  <div className="flex items-center space-x-1">
                    <CreditCard className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-800 capitalize">
                      {paymentDetails.paymentMethod || 'PayPal'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-700">Transaction ID:</span>
                  <span className="text-sm font-mono text-green-800">
                    #{paymentDetails.transactionId.slice(-8)}
                  </span>
                </div>

                {paymentDetails.raffleTitle && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-700">Raffle:</span>
                    <span className="text-sm font-semibold text-green-800 text-right max-w-32 truncate">
                      {paymentDetails.raffleTitle}
                    </span>
                  </div>
                )}

                {paymentDetails.ticketQuantity && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-700">Tickets:</span>
                    <span className="text-sm font-semibold text-green-800">
                      {paymentDetails.ticketQuantity} ticket{paymentDetails.ticketQuantity > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setShow(false);
              setTimeout(onClose, 300);
            }}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Great!
          </button>
          <button
            onClick={() => window.location.href = '/dashboard/tickets'}
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            View Tickets
          </button>
        </div>
      </div>

      {/* Backdrop */}
      <div 
        className={`fixed inset-0 backdrop-blur-sm transition-opacity transition-opacity duration-300 ${
          show ? 'opacity-30' : 'opacity-0'
        }`}
        onClick={() => {
          setShow(false);
          setTimeout(onClose, 300);
        }}
      />
    </div>
  );
};

export default PaymentSuccessAlert; 