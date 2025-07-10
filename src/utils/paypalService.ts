// PayPal Frontend Service
import { API_BASE_URL } from '../constants/constants';

export interface PayPalPaymentResponse {
  success: boolean;
  payment_id: string;
  approval_url: string;
  paypal_payment_id: string;
  instant_optimized?: boolean;
  message?: string;
  error?: string;
}

export interface PayPalPaymentRequest {
  raffle_id: number;
  quantity?: number;
  amount?: number;
  payment_method: 'paypal';
}

export interface PayPalStatusResponse {
  success: boolean;
  status: string;
  message: string;
  payment: {
    id: number;
    amount: number;
    payment_method: string;
    status: string;
    quantity?: number;
    raffle?: {
      title: string;
      type: string;
    };
  };
  is_completed: boolean;
  is_pending: boolean;
  timestamp: string;
}

class PayPalService {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Create PayPal payment for ticket purchase
   */
  async createTicketPayment(request: PayPalPaymentRequest): Promise<PayPalPaymentResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/paypal/tickets`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create PayPal payment');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('PayPal ticket payment error:', error);
      throw error;
    }
  }

  /**
   * Create PayPal payment for donation
   */
  async createDonationPayment(request: PayPalPaymentRequest): Promise<PayPalPaymentResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/paypal/donations`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create PayPal donation payment');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('PayPal donation payment error:', error);
      throw error;
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<PayPalStatusResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/status?payment_id=${paymentId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get payment status');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('PayPal payment status error:', error);
      throw error;
    }
  }

  /**
   * Poll payment status until completion or timeout
   */
  async pollPaymentStatus(
    paymentId: string,
    onStatusUpdate: (status: PayPalStatusResponse) => void,
    maxAttempts: number = 30,
    interval: number = 2000
  ): Promise<PayPalStatusResponse> {
    let attempts = 0;
    
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          attempts++;
          const status = await this.getPaymentStatus(paymentId);
          onStatusUpdate(status);

          if (status.is_completed || !status.is_pending) {
            resolve(status);
            return;
          }

          if (attempts >= maxAttempts) {
            reject(new Error('Payment status polling timeout'));
            return;
          }

          setTimeout(poll, interval);
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }

  /**
   * Handle PayPal return URL parameters
   */
  parseReturnUrl(searchParams: URLSearchParams): {
    success: boolean;
    paymentId?: string;
    amount?: number;
    method?: string;
    raffleTitle?: string;
    quantity?: number;
    instant?: boolean;
  } {
    const paymentSuccess = searchParams.get('payment_success');
    const paymentId = searchParams.get('payment_id');
    const amount = searchParams.get('amount');
    const method = searchParams.get('method');
    const raffleTitle = searchParams.get('raffle_title');
    const quantity = searchParams.get('quantity');
    const instant = searchParams.get('instant');

    return {
      success: paymentSuccess === 'true',
      paymentId: paymentId || undefined,
      amount: amount ? parseFloat(amount) : undefined,
      method: method || undefined,
      raffleTitle: raffleTitle || undefined,
      quantity: quantity ? parseInt(quantity) : undefined,
      instant: instant === 'true',
    };
  }

  /**
   * Format payment details for display
   */
  formatPaymentDetails(payment: PayPalStatusResponse['payment']): {
    amount: number;
    paymentMethod: string;
    transactionId: string;
    raffleTitle?: string;
    ticketQuantity?: number;
  } {
    return {
      amount: payment.amount || 0,
      paymentMethod: payment.payment_method || 'PayPal',
      transactionId: payment.id.toString(),
      raffleTitle: payment.raffle?.title,
      ticketQuantity: payment.raffle?.type === 'raffle' ? payment.quantity : undefined,
    };
  }
}

export default new PayPalService(); 