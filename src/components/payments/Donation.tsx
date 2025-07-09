import React, { useState } from 'react';
import paddleService from '../../utils/paddleService';

interface DonationProps {
  raffleId: string;
  raffleTitle: string;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
}

const Donation: React.FC<DonationProps> = ({
  raffleId,
  raffleTitle,
  onSuccess,
  onError,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const presetAmounts = [5, 10, 25, 50, 100];

  const handlePresetAmount = (value: number) => {
    setSelectedAmount(value);
    setAmount(value.toString());
  };

  const handleCustomAmount = (value: string) => {
    setSelectedAmount(null);
    setAmount(value);
  };

  const handleDonate = async () => {
    const donationAmount = parseFloat(amount);
    
    if (!donationAmount || donationAmount < 1) {
      if (onError) {
        onError('Please enter a valid donation amount (minimum $1.00)');
      }
      return;
    }

    if (donationAmount > 999999) {
      if (onError) {
        onError('Maximum donation amount is $999,999.99');
      }
      return;
    }

    try {
      setIsLoading(true);
      
      const result = await paddleService.createDonationCheckout(raffleId, donationAmount);
      
      if (result.success && result.checkout_url) {
        // Redirect to Paddle checkout
        paddleService.redirectToCheckout(result.checkout_url);
        
        if (onSuccess && result.payment_id) {
          onSuccess(result.payment_id);
        }
      } else {
        const error = result.error || 'Failed to create donation checkout';
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

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4">Make a Donation</h3>
      <p className="text-gray-600 mb-6">Support {raffleTitle} with a donation</p>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Choose donation amount
        </label>
        
        {/* Preset amounts */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {presetAmounts.map((preset) => (
            <button
              key={preset}
              onClick={() => handlePresetAmount(preset)}
              className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                selectedAmount === preset
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              ${preset}
            </button>
          ))}
        </div>

        {/* Custom amount */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 text-lg">$</span>
          </div>
          <input
            type="number"
            min="1"
            max="999999"
            step="0.01"
            value={amount}
            onChange={(e) => handleCustomAmount(e.target.value)}
            placeholder="Enter custom amount"
            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">Minimum donation: $1.00</p>
      </div>

      {amount && parseFloat(amount) >= 1 && (
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Donation amount:</span>
            <span className="text-xl font-bold text-green-600">
              ${parseFloat(amount).toFixed(2)}
            </span>
          </div>
        </div>
      )}

      <button
        onClick={handleDonate}
        disabled={isLoading || !amount || parseFloat(amount) < 1}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing...
          </div>
        ) : (
          'Donate Now'
        )}
      </button>

      <p className="text-xs text-gray-500 mt-3 text-center">
        You will be redirected to Paddle for secure payment processing
      </p>
    </div>
  );
};

export default Donation;
