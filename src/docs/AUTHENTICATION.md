# Authentication System with Automatic Token Management

This documentation explains how the enhanced authentication system works and how to use it throughout the application.

## Overview

The authentication system has been enhanced to automatically clear tokens when users are not logged in, handle token validation, and manage authentication state more robustly.

## Key Features

- **Automatic Token Validation**: Tokens are validated against the backend on app initialization
- **Automatic Token Cleanup**: Invalid or expired tokens are automatically cleared
- **Periodic Token Validation**: Tokens are re-validated every 5 minutes
- **HTTP Interceptors**: API calls automatically handle authentication and 401 responses
- **Centralized Token Management**: All token operations go through a centralized `TokenManager`

## Core Components

### 1. TokenManager (`src/context/tokenManager.ts`)

Centralized utility for managing authentication tokens:

```typescript
// Get current token
const token = TokenManager.getToken();

// Validate token against backend
const isValid = await TokenManager.validateToken(token);

// Clear all authentication data
TokenManager.clearAllAuthData();

// Create authenticated fetch function
const authenticatedFetch = TokenManager.createAuthenticatedFetch();
```

### 2. Enhanced AuthContext (`src/context/AuthContext.tsx`)

The AuthContext now:
- Validates tokens on initialization
- Automatically clears invalid tokens
- Runs periodic token validation
- Uses the TokenManager for all token operations

### 3. API Client (`src/utils/apiClient.ts`)

Pre-configured axios instance that:
- Automatically adds Bearer tokens to requests
- Handles 401 responses by clearing tokens and redirecting to login
- Provides consistent API interaction patterns

## Usage Examples

### Making Authenticated API Calls

#### Option 1: Using the API Client (Recommended)

```typescript
import apiClient from '../utils/apiClient';

// The API client automatically handles authentication
const fetchUserProfile = async () => {
  try {
    const response = await apiClient.get('/profile');
    return response.data;
  } catch (error) {
    // 401 errors are automatically handled
    console.error('Failed to fetch profile:', error);
  }
};
```

#### Option 2: Using the Authenticated Fetch Function

```typescript
import { TokenManager } from '../context/tokenManager';

const authenticatedFetch = TokenManager.createAuthenticatedFetch();

const fetchData = async () => {
  try {
    const response = await authenticatedFetch('/api/profile');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Request failed:', error);
  }
};
```

### Checking Authentication Status

```typescript
import { useAuth } from '../context/authUtils';
import { TokenManager } from '../context/tokenManager';

const MyComponent = () => {
  const { isAuthenticated, user } = useAuth();

  // Manual token validation
  const validateToken = async () => {
    const token = TokenManager.getToken();
    if (token) {
      const isValid = await TokenManager.validateToken(token);
      console.log('Token is valid:', isValid);
    }
  };

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return <div>Welcome, {user?.first_name}!</div>;
};
```

### Manual Logout

```typescript
import { useAuth } from '../context/authUtils';
import { TokenManager } from '../context/tokenManager';

const LogoutButton = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    // Clear all authentication data and update context
    TokenManager.clearAllAuthData();
    logout();
    
    // Redirect to login page
    window.location.href = '/login';
  };

  return <button onClick={handleLogout}>Logout</button>;
};
```

## Automatic Token Cleanup Scenarios

The system automatically clears tokens in these scenarios:

1. **Invalid Token on App Load**: When the app starts, if the stored token is invalid
2. **401 API Responses**: When any API call receives a 401 Unauthorized response
3. **Periodic Validation Failure**: When the periodic token validation (every 5 minutes) fails
4. **Manual Validation**: When `TokenManager.validateToken()` determines a token is invalid

## Migration Guide

To update existing components to use the new system:

### Before (Old Approach)

```typescript
const fetchData = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/profile', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch');
  }
  
  return response.json();
};
```

### After (New Approach)

```typescript
import apiClient from '../utils/apiClient';

const fetchData = async () => {
  const response = await apiClient.get('/profile');
  return response.data;
};
```

## Benefits

1. **Improved Security**: Tokens are regularly validated and cleared when invalid
2. **Better UX**: Users are automatically redirected when their session expires
3. **Reduced Boilerplate**: No need to manually handle tokens in every API call
4. **Consistent Error Handling**: 401 errors are handled uniformly across the app
5. **Automatic Cleanup**: Prevents stale tokens from remaining in localStorage

## Configuration

### Token Validation Interval

To change the periodic validation interval, modify the interval in `AuthContext.tsx`:

```typescript
// Check every 5 minutes (default)
}, 5 * 60 * 1000);

// Check every 10 minutes
}, 10 * 60 * 1000);
```

### API Client Timeout

To modify the API client timeout, update `apiClient.ts`:

```typescript
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds (default)
});
```

## Testing

To test the authentication system:

1. **Log in normally** - Token should be stored and validated
2. **Manually clear token from localStorage** - App should detect and clear remaining auth data
3. **Wait for periodic validation** - Invalid tokens should be cleared after 5 minutes
4. **Make API calls with expired token** - Should automatically logout and redirect
5. **Use the AuthExampleComponent** - Provides UI for testing all authentication features

## Troubleshooting

### Common Issues

1. **Infinite redirect loops**: Ensure login page doesn't trigger auth validation
2. **Token not clearing**: Check that TokenManager.clearAllAuthData() is being called
3. **API calls failing**: Verify the token is being included in headers
4. **Context not updating**: Ensure you're using the updated AuthContext

### Debug Mode

Add logging to see authentication flow:

```typescript
// In TokenManager.validateToken()
console.log('Validating token:', token);
console.log('Validation result:', isValid);

// In AuthContext initialization
console.log('Auth initialization - token:', !!token, 'user:', !!user);
```
