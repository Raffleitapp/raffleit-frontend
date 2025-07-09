import { FC } from 'react';
import { CreditCard } from 'lucide-react';

interface PaymentOptionsProps {
  onPayPalClick: () => void;
  onPaddleClick: () => void;
  disabled?: boolean;
  purchasing?: boolean;
  isDashboard?: boolean;
}

const PaymentOptions: FC<PaymentOptionsProps> = ({
  onPayPalClick,
  onPaddleClick,
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
    <div className="border-t pt-4">
      <p className="text-center text-sm text-slate-500 mb-4">Select a payment method</p>
      <div className="flex gap-4">
        <button
          onClick={onPayPalClick}
          disabled={disabled || purchasing}
          className={`flex-1 px-6 py-4 bg-yellow-400 text-slate-800 rounded-lg hover:bg-yellow-500 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 flex items-center justify-center gap-3 ${
            isDashboard ? 'shadow-md' : ''
          }`}
        >
          <PayPalIcon />
          <span>{purchasing ? 'Processing...' : 'PayPal'}</span>
        </button>
        <button
          onClick={onPaddleClick}
          disabled={disabled || purchasing}
          className={`flex-1 px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 flex items-center justify-center gap-3 ${
            isDashboard ? 'shadow-md' : ''
          }`}
        >
          <PaddleIcon />
          <span>{purchasing ? 'Processing...' : 'Pay with Card'}</span>
        </button>
      </div>
    </div>
  );
};

export default PaymentOptions;
