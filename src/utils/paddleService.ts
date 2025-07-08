interface CreateCheckoutResponse {
  success: boolean;
  payment_id?: string;
  checkout_url?: string;
  checkout_id?: string;
  error?: string;
}

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

interface PaymentHistoryResponse {
  success: boolean;
  payments?: {
    data: PaymentHistoryItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  error?: string;
}

class PaddleService {
  private apiUrl: string;

  constructor() {
    // Use relative API URL or derive from current domain
    // This way no environment variables are needed
    this.apiUrl = '/api'; // Assumes API is served from same domain, or use full URL in production
    
    // Alternative: Derive from current location
    // this.apiUrl = `${window.location.protocol}//${window.location.hostname}:8000/api`;
  }

  async createTicketCheckout(raffleId: string, quantity: number): Promise<CreateCheckoutResponse> {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      const response = await fetch(`${this.apiUrl}/payments/tickets/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          raffle_id: raffleId,
          quantity: quantity,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to create ticket checkout:', error);
      throw error;
    }
  }

  async createDonationCheckout(raffleId: string, amount: number): Promise<CreateCheckoutResponse> {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      const response = await fetch(`${this.apiUrl}/payments/donations/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          raffle_id: raffleId,
          amount: amount,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to create donation checkout:', error);
      throw error;
    }
  }

  async getPaymentHistory(): Promise<PaymentHistoryResponse> {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      const response = await fetch(`${this.apiUrl}/payments/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get payment history:', error);
      throw error;
    }
  }

  async getPayment(paymentId: string) {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    try {
      const response = await fetch(`${this.apiUrl}/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get payment:', error);
      throw error;
    }
  }

  // Redirect to Paddle checkout URL (recommended approach)
  redirectToCheckout(checkoutUrl: string) {
    window.location.href = checkoutUrl;
  }
}

export const paddleService = new PaddleService();
export default paddleService;
