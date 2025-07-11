import { API_BASE_URL } from '../constants/constants';

// Paddle JS SDK Types
declare global {
  interface Window {
    Paddle: {
      Environment: {
        set: (environment: 'sandbox' | 'production') => void;
      };
      Setup: (options: {
        token: string;
        eventCallback?: (data: any) => void;
      }) => void;
      Checkout: {
        open: (options: {
          items: Array<{
            priceId?: string;
            price?: {
              description: string;
              name: string;
              unitPrice: {
                amount: string;
                currencyCode: string;
              };
            };
            quantity?: number;
          }>;
          customer?: {
            email?: string;
            id?: string;
          };
          customData?: Record<string, any>;
          settings?: {
            displayMode?: 'inline' | 'overlay';
            theme?: 'light' | 'dark';
            locale?: string;
            allowLogout?: boolean;
            showAddTaxId?: boolean;
            showAddDiscounts?: boolean;
            variant?: 'multi-page' | 'one-page';
            successUrl?: string;
            frameTarget?: string;
            frameInitialHeight?: number;
            frameStyle?: string;
          };
        }) => void;
      };
      Spinner: {
        show: () => void;
        hide: () => void;
      };
      Status: {
        get: () => Promise<{
          isComplete: boolean;
          data?: any;
        }>;
      };
    };
  }
}

interface PaddleConfig {
  environment: 'sandbox' | 'production';
  token: string;
  seller_id: string;
}

interface CreateCheckoutResponse {
  success: boolean;
  payment_id?: string;
  checkout_url?: string;
  checkout_id?: string;
  checkout_data?: any;
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
  private isInitialized = false;
  private config: PaddleConfig | null = null;

  constructor() {
    this.initializePaddle();
  }

  private async initializePaddle() {
    try {
      // Get Paddle configuration from backend
      const response = await fetch(`${API_BASE_URL}/paddle/config`);
      const configData = await response.json();

      if (configData.success) {
        this.config = {
          environment: configData.environment || 'sandbox',
          token: configData.client_token,
          seller_id: configData.seller_id
        };

        // Wait for Paddle to be available
        if (typeof window !== 'undefined' && window.Paddle) {
          this.setupPaddle();
        } else {
          // Wait for Paddle to load
          const checkPaddle = setInterval(() => {
            if (window.Paddle) {
              clearInterval(checkPaddle);
              this.setupPaddle();
            }
          }, 100);
        }
      } else {
        console.warn('Paddle configuration not available:', configData);
      }
    } catch (error) {
      console.error('Failed to initialize Paddle:', error);
    }
  }

  private setupPaddle() {
    if (!this.config || !window.Paddle) {
      return;
    }

    try {
      // Set environment
      window.Paddle.Environment.set(this.config.environment);

      // Setup Paddle
      window.Paddle.Setup({
        token: this.config.token,
        eventCallback: (data) => {
          console.log('Paddle event:', data);
          this.handlePaddleEvent(data);
        }
      });

      this.isInitialized = true;
      console.log('Paddle initialized successfully');
    } catch (error) {
      console.error('Failed to setup Paddle:', error);
    }
  }

  private handlePaddleEvent(data: any) {
    console.log('Paddle event received:', data);
    
    switch (data.name) {
      case 'checkout.completed':
        this.handleCheckoutCompleted(data);
        break;
      case 'checkout.closed':
        this.handleCheckoutClosed(data);
        break;
      case 'checkout.loaded':
        console.log('Checkout loaded');
        break;
      default:
        console.log('Unhandled Paddle event:', data.name);
    }
  }

  private handleCheckoutCompleted(data: any) {
    console.log('Checkout completed:', data);
    
    // Redirect to success page with payment info
    const customData = data.data?.custom_data || {};
    const paymentId = customData.payment_id;
    
    if (paymentId) {
      window.location.href = `${window.location.origin}/payment-success?payment_id=${paymentId}&method=paddle`;
    } else {
      // Fallback redirect
      window.location.href = `${window.location.origin}/?payment_success=true&method=paddle`;
    }
  }

  private handleCheckoutClosed(data: any) {
    console.log('Checkout closed:', data);
    // Handle checkout closed event if needed
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async createTicketCheckout(raffleId: string, quantity: number): Promise<CreateCheckoutResponse> {
    if (!this.isInitialized) {
      throw new Error('Paddle not initialized. Please wait and try again.');
    }

    try {
      // Use the regular paddle endpoint (not inline) since we're doing redirect-based checkout
      const response = await fetch(`${API_BASE_URL}/payments/paddle/tickets`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
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
    if (!this.isInitialized) {
      throw new Error('Paddle not initialized. Please wait and try again.');
    }

    try {
      // Use the regular paddle endpoint (not inline) since we're doing redirect-based checkout
      const response = await fetch(`${API_BASE_URL}/payments/paddle/donations`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
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

  // Open inline checkout using Paddle JS
  async openInlineCheckout(checkoutData: any): Promise<void> {
    if (!this.isInitialized || !window.Paddle) {
      throw new Error('Paddle not initialized');
    }

    try {
      console.log('Opening Paddle checkout with data:', checkoutData);
      console.log('Items being sent:', JSON.stringify(checkoutData.items, null, 2));
      
      // Show loading spinner
      window.Paddle.Spinner.show();
      
      // Open checkout
      window.Paddle.Checkout.open({
        ...checkoutData,
        settings: {
          displayMode: 'overlay',
          theme: 'light',
          allowLogout: false,
          variant: 'multi-page'
        }
      });

      // Hide spinner after a delay
      setTimeout(() => {
        window.Paddle.Spinner.hide();
      }, 1000);
    } catch (error) {
      console.error('Failed to open Paddle checkout:', error);
      window.Paddle.Spinner.hide();
      throw error;
    }
  }

  // Create and redirect to ticket checkout (simplified)
  async purchaseTicketsInline(raffleId: string, quantity: number): Promise<void> {
    try {
      console.log('Creating Paddle ticket checkout for redirect...');
      const response = await this.createTicketCheckout(raffleId, quantity);
      
      if (response.success && response.checkout_url) {
        console.log('Redirecting to Paddle checkout:', response.checkout_url);
        window.location.href = response.checkout_url;
      } else {
        throw new Error(response.error || 'Failed to create Paddle checkout');
      }
    } catch (error) {
      console.error('Failed to purchase tickets:', error);
      throw error;
    }
  }

  // Create and redirect to donation checkout (simplified) 
  async donateInline(raffleId: string, amount: number): Promise<void> {
    try {
      console.log('Creating Paddle donation checkout for redirect...');
      const response = await this.createDonationCheckout(raffleId, amount);
      
      if (response.success && response.checkout_url) {
        console.log('Redirecting to Paddle checkout:', response.checkout_url);
        window.location.href = response.checkout_url;
      } else {
        throw new Error(response.error || 'Failed to create Paddle checkout');
      }
    } catch (error) {
      console.error('Failed to make donation:', error);
      throw error;
    }
  }

  async getPaymentHistory(): Promise<PaymentHistoryResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/history`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
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
    try {
      const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
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

  // Check if Paddle is ready
  isReady(): boolean {
    return this.isInitialized && !!window.Paddle;
  }

  // Get current configuration
  getConfig(): PaddleConfig | null {
    return this.config;
  }

  // Legacy method for backward compatibility
  redirectToCheckout(checkoutUrl: string) {
    window.location.href = checkoutUrl;
  }
}

export const paddleService = new PaddleService();
export default paddleService;
