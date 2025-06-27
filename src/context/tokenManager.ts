import { API_BASE_URL } from '../constants/constants';

// Enhanced token management utilities
export class TokenManager {
  private static readonly TOKEN_KEY = 'token';
  private static readonly USER_DATA_KEY = 'user_data';
  private static readonly ROLE_KEY = 'role';

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static clearAllAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_DATA_KEY);
    localStorage.removeItem(this.ROLE_KEY);
  }

  static async validateToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        // Token is invalid or expired
        this.clearAllAuthData();
        // Optionally redirect to login
        window.location.href = '/login';
        return false;
      }
      
      return response.ok;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }

  static createAuthenticatedFetch() {
    return async (url: string, options: RequestInit = {}): Promise<Response> => {
      const token = this.getToken();
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        headers,
      });

      // If we get a 401, the token is invalid/expired
      if (response.status === 401) {
        console.log('Authentication failed, clearing token and redirecting to login');
        this.clearAllAuthData();
        window.location.href = '/login';
        throw new Error('Authentication failed');
      }

      return response;
    };
  }
}

// Create a pre-configured authenticated fetch function
export const authenticatedFetch = TokenManager.createAuthenticatedFetch();
