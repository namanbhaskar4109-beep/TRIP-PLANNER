import { User, AtlasStatus, AuthResponse } from '../types/auth';
import { TripPlan, Expense } from '../types/trip';

const API_BASE = '/api';

/**
 * Helper to make API requests with standard headers & error handling
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = localStorage.getItem('trip_planner_auth_token');
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({
      success: false,
      message: `Failed to parse response (${response.status})`,
    }));

    if (!response.ok && data.success === undefined) {
      data.success = false;
    }

    return data as T;
  } catch (err: any) {
    // Graceful handling when express server is not yet running
    return {
      success: false,
      isDbOffline: true,
      message: 'Unable to reach the backend server on port 5000. Please make sure the server is running (`npm run server` or `npm run dev:all`).',
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
 * Retrieve authenticated user profile from MongoDB Atlas
 */
export async function fetchCurrentUser(): Promise<{ success: boolean; user?: User; message?: string }> {
  return request<{ success: boolean; user?: User; message?: string }>('/auth/me');
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
