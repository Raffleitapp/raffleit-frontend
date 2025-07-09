import React, { useState } from 'react';
import paddleService from '../../utils/paddleService';

interface TicketPurchaseProps {
  raffleId: string;
  raffleTitle: string;
  ticketPrice: number;
  maxTickets?: number;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
}

const TicketPurchase: React.FC<TicketPurchaseProps> = ({
  raffleId,
  raffleTitle,
  ticketPrice,
  maxTickets = 10,
  onSuccess,
  onError,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const totalPrice = quantity * ticketPrice;

  const handlePurchase = async () => {
    try {
      setIsLoading(true);
      
      const result = await paddleService.createTicketCheckout(raffleId, quantity);
      
      if (result.success && result.checkout_url) {
        // Redirect to Paddle checkout
        paddleService.redirectToCheckout(result.checkout_url);
        
        if (onSuccess && result.payment_id) {
          onSuccess(result.payment_id);
        }
      } else {
        const error = result.error || 'Failed to create checkout session';
        if (onError) {
          onError(error);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const incrementQuantity = () => {
    if (quantity < maxTickets) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4">Purchase Tickets</h3>
      <p className="text-gray-600 mb-4">{raffleTitle}</p>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Number of tickets
        </label>
        <div className="flex items-center space-x-3">
          <button
            onClick={decrementQuantity}
            disabled={quantity <= 1}
            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            −
          </button>
          <span className="w-8 text-center font-medium">{quantity}</span>
          <button
            onClick={incrementQuantity}
            disabled={quantity >= maxTickets}
            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">Maximum {maxTickets} tickets per purchase</p>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-600">Price per ticket:</span>
          <span className="font-medium">${ticketPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-t">
          <span className="font-semibold">Total:</span>
          <span className="text-xl font-bold text-green-600">${totalPrice.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={handlePurchase}
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing...
          </div>
        ) : (
          `Purchase ${quantity} Ticket${quantity > 1 ? 's' : ''}`
        )}
      </button>

      <p className="text-xs text-gray-500 mt-3 text-center">
        You will be redirected to Paddle for secure payment processing
      </p>
    </div>
  );
};

export default TicketPurchase;
