import React, { useEffect } from 'react';
import { X, Clock } from 'lucide-react';

// Simple local type for payment status
interface PaymentStatusResponse {
  success: boolean;
  status: string;
  message: string;
  error?: string;
}

interface PaymentProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: string;
  onPaymentComplete?: (status: PaymentStatusResponse) => void;
  onPaymentFailed?: (status: PaymentStatusResponse) => void;
}

const PaymentProcessingModal: React.FC<PaymentProcessingModalProps> = ({
  isOpen,
  onClose,
  paymentId,
}) => {
  // Auto-close modal after 8 seconds if still processing
  useEffect(() => {
    if (isOpen && paymentId) {
      const timeout = setTimeout(() => {
        onClose();
      }, 8000);

      return () => clearTimeout(timeout);
    }
  }, [isOpen, paymentId, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm transition-opacity bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <div className="text-center">
          <div className="mb-4">
            <Clock size={48} className="mx-auto text-blue-500 animate-spin" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Processing Payment
          </h3>
          
          <p className="text-gray-600 mb-4">
            Your payment is being processed. Please wait while we confirm your transaction.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Payment ID:</strong> {paymentId.slice(-8)}
            </p>
            <p className="text-sm text-blue-600 mt-1">
              You will be redirected automatically once the payment is confirmed.
            </p>
          </div>

          <div className="mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentProcessingModal;
