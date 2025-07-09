import { FC } from 'react';
import { CreditCard } from 'lucide-react';

interface PaymentOptionsProps {
  onPayPalClick: () => void;
  onPaddleClick?: () => void; // Make optional since it's disabled
  onCancel?: () => void; // Cancel callback
  disabled?: boolean;
  purchasing?: boolean;
  isDashboard?: boolean;
}

const PaymentOptions: FC<PaymentOptionsProps> = ({
  onPayPalClick,
  // onPaddleClick, // Disabled for now
  onCancel,
  disabled = false,
  purchasing = false,
  isDashboard = false,
}) => {
  // PayPal SVG Icon
  const PayPalIcon = () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
      <path d="M8.5 2h7c2.76 0 5 2.24 5 5 0 1.38-.56 2.63-1.46 3.54A5.03 5.03 0 0 1 15 12H9.5l-1 6H6l2-12h0.5z" fill="#0070ba"/>
      <path d="M7.5 8h7c1.66 0 3 1.34 3 3s-1.34 3-3 3h-5.5L7.5 8z" fill="#003087"/>
      <path d="M6 14h5.5c1.38 0 2.5 1.12 2.5 2.5S12.88 19 11.5 19H8l-2-5z" fill="#0070ba"/>
    </svg>
  );

  // Paddle/Card SVG Icon
  const PaddleIcon = () => (
    <CreditCard className="w-6 h-6" />
  );

  return (
    <div className="border-t pt-3 sm:pt-4">
      <p className="text-center text-xs sm:text-sm text-slate-500 mb-3 sm:mb-4">Select a payment method</p>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <button
          onClick={onPayPalClick}
          disabled={disabled || purchasing}
          className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-yellow-400 text-slate-800 rounded-lg hover:bg-yellow-500 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base ${
            isDashboard ? 'shadow-md' : ''
          }`}
        >
          <PayPalIcon />
          <span className="hidden xs:inline">{purchasing ? 'Processing...' : 'PayPal'}</span>
          <span className="xs:hidden">{purchasing ? 'Processing...' : 'Pay'}</span>
        </button>
        
        {/* Active Paddle Button - Uncomment when ready to enable */}
        {/* <button
          onClick={onPaddleClick}
          disabled={disabled || purchasing}
          className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base ${
            isDashboard ? 'shadow-md' : ''
          }`}
        >
          <PaddleIcon />
          <span className="hidden xs:inline">{purchasing ? 'Processing...' : 'Pay with Card'}</span>
          <span className="xs:hidden">{purchasing ? 'Processing...' : 'Card'}</span>
        </button> */}
        
        {/* Disabled Paddle Button - Remove when ready to enable */}
        <button
          disabled={true}
          className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-slate-300 text-slate-500 rounded-lg cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base ${
            isDashboard ? 'shadow-md' : ''
          }`}
        >
          <PaddleIcon />
          <span className="hidden xs:inline">Card Payments - Coming Soon</span>
          <span className="xs:hidden">Coming Soon</span>
        </button>
      </div>
      
      {/* Cancel Button Section */}
      <div className="mt-4 pt-3 border-t border-slate-200">
        <div className="text-center">
          <button
            className="px-4 sm:px-6 py-2 sm:py-3 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm sm:text-base min-w-[80px]"
            onClick={() => {
              if (onCancel) {
                onCancel();
              } else {
                // Fallback: dispatch custom event for backward compatibility
                const event = new CustomEvent('cancelPayment');
                window.dispatchEvent(event);
              }
            }}
            disabled={purchasing}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentOptions;
