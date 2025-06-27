import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/authUtils';
import apiClient from '../../utils/apiClient';
import { TokenManager } from '../../context/tokenManager';

/**
 * Example component demonstrating how to handle authentication
 * and automatic token cleanup when user is not logged in
 */
const AuthExampleComponent: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [data, setData] = useState<object | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Example of making authenticated API calls
  const fetchProtectedData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Using the configured API client - it will automatically:
      // 1. Add the Bearer token to the request
      // 2. Clear token and redirect to login on 401 responses
      const response = await apiClient.get('/profile');
      setData(response.data);
    } catch (err) {
      setError('Failed to fetch data');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Example of manual token validation
  const validateCurrentToken = async () => {
    const token = TokenManager.getToken();
    if (token) {
      const isValid = await TokenManager.validateToken(token);
      if (!isValid) {
        console.log('Token is invalid, will be cleared automatically');
        // Token is automatically cleared by TokenManager.validateToken
      } else {
        console.log('Token is valid');
      }
    } else {
      console.log('No token found');
    }
  };

  // Example of clearing auth data manually
  const handleManualLogout = () => {
    TokenManager.clearAllAuthData();
    logout(); // Also updates the auth context
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProtectedData();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-red-800 font-semibold">Not Authenticated</h3>
        <p className="text-red-700">
          You must be logged in to view this content. 
          Token has been automatically cleared.
        </p>
        <button 
          onClick={() => window.location.href = '/login'}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Authentication Status</h2>
      
      <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
        <h3 className="text-green-800 font-semibold">✓ Authenticated</h3>
        <p className="text-green-700">
          Welcome, {user?.first_name} {user?.last_name} ({user?.email})
        </p>
        <p className="text-sm text-green-600 mt-1">
          Role: {user?.role}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Actions:</h3>
          <div className="space-x-2">
            <button
              onClick={fetchProtectedData}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Fetch Protected Data'}
            </button>
            
            <button
              onClick={validateCurrentToken}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Validate Token
            </button>
            
            <button
              onClick={handleManualLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {data && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <h3 className="font-semibold mb-2">Protected Data:</h3>
            <pre className="text-sm text-gray-700 overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="font-semibold text-blue-800 mb-2">How this works:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Authentication status is checked on app initialization</li>
          <li>• Tokens are validated against the backend</li>
          <li>• Invalid tokens are automatically cleared</li>
          <li>• API calls automatically include authentication headers</li>
          <li>• 401 responses trigger automatic logout and redirect</li>
          <li>• Token validation runs periodically (every 5 minutes)</li>
        </ul>
      </div>
    </div>
  );
};

export default AuthExampleComponent;
