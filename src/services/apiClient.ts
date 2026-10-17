import { User, AtlasStatus, AuthResponse, ForgotPasswordResponse, ResetPasswordResponse } from '../types/auth';
import { TripPlan, Expense } from '../types/trip';

const API_BASE = '/api';

/**
 * Make API requests with standard headers, credentials (cookies), and fallback Bearer token
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Fallback to Bearer token from storage if available
  const storedToken = localStorage.getItem('trip_planner_auth_token');
  if (storedToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${storedToken}`);
  }

  // Include credentials so HttpOnly cookies are transmitted across requests
  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);

    let data: any;
    try {
      data = await response.json();
    } catch {
      if (response.status === 502 || response.status === 504 || response.status === 503) {
        return {
          success: false,
          isDbOffline: true,
          message: 'The Express server is not running on port 5000 (HTTP 502 Bad Gateway). Please start the backend server with `npm run server` or `npm run dev:all`.',
        } as unknown as T;
      }
      data = {
        success: false,
        message: `Server returned HTTP ${response.status}`,
      };
    }

    if (!response.ok && data.success === undefined) {
      data.success = false;
    }

    return data as T;
  } catch (err: any) {
    // Graceful handling when express backend server is offline or unreachable
    return {
      success: false,
      isDbOffline: true,
      message: 'Unable to connect to the backend server. Please make sure the server is running on port 5000 (`npm run server` or `npm run dev:all`).',
      error: err.message,
    } as unknown as T;
  }
}

/**
 * Register a new user with MongoDB Atlas
 */
export async function registerUser(name: string, email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

/**
 * Sign in existing user with MongoDB Atlas credentials
 */
export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Sign out user and clear HttpOnly cookie session
 */
export async function logoutUser(): Promise<{ success: boolean; message: string }> {
  return request<{ success: boolean; message: string }>('/auth/logout', {
    method: 'POST',
  });
}

/**
 * Retrieve currently logged-in user profile from MongoDB Atlas via HttpOnly cookie or token
 */
export async function fetchCurrentUser(): Promise<{ success: boolean; user?: User; message?: string }> {
  return request<{ success: boolean; user?: User; message?: string }>('/auth/me');
}

/**
 * Request password reset token for given email
 */
export async function requestForgotPassword(email: string): Promise<ForgotPasswordResponse> {
  return request<ForgotPasswordResponse>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

/**
 * Reset password using token
 */
export async function resetPassword(token: string, password: string): Promise<ResetPasswordResponse> {
  return request<ResetPasswordResponse>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}

/**
 * Query current MongoDB Atlas connection status and ping
 */
export async function fetchAtlasStatus(): Promise<{ success: boolean; data?: AtlasStatus; message?: string }> {
  return request<{ success: boolean; data?: AtlasStatus; message?: string }>('/auth/atlas-status');
}

/**
 * Test a MongoDB Atlas connection URI
 */
export async function testAtlasConnection(uri: string): Promise<{ success: boolean; message: string; data?: AtlasStatus }> {
  return request<{ success: boolean; message: string; data?: AtlasStatus }>('/auth/test-atlas', {
    method: 'POST',
    body: JSON.stringify({ uri }),
  });
}

/**
 * Sync active trip and expenses to MongoDB Atlas
 */
export async function syncTripToAtlas(trip: TripPlan, expenses: Expense[]): Promise<{ success: boolean; message: string; data?: any }> {
  return request<{ success: boolean; message: string; data?: any }>('/trips/sync', {
    method: 'POST',
    body: JSON.stringify({ trip, expenses }),
  });
}

/**
 * Get latest trip saved by user in MongoDB Atlas
 */
export async function fetchLatestAtlasTrip(): Promise<{ success: boolean; data?: any; message?: string }> {
  return request<{ success: boolean; data?: any; message?: string }>('/trips/latest');
}
