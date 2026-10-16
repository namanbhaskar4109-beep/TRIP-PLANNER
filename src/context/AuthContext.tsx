import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AtlasStatus, AuthResponse } from '../types/auth';
import {
  loginUser,
  registerUser,
  fetchCurrentUser,
  fetchAtlasStatus,
  testAtlasConnection,
  syncTripToAtlas,
} from '../services/apiClient';
import { TripPlan, Expense } from '../types/trip';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  atlasStatus: AtlasStatus | null;
  isCheckingAtlas: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  isAtlasModalOpen: boolean;
  openLoginModal: () => void;
  openRegisterModal: () => void;
  closeAuthModal: () => void;
  openAtlasModal: () => void;
  closeAtlasModal: () => void;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (name: string, email: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
  refreshAtlasStatus: () => Promise<void>;
  testUri: (uri: string) => Promise<{ success: boolean; message: string; data?: AtlasStatus }>;
  syncTrip: (trip: TripPlan, expenses: Expense[]) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'trip_planner_auth_token';
const USER_KEY = 'trip_planner_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY);
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [atlasStatus, setAtlasStatus] = useState<AtlasStatus | null>(null);
  const [isCheckingAtlas, setIsCheckingAtlas] = useState<boolean>(false);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isAtlasModalOpen, setIsAtlasModalOpen] = useState(false);

  const refreshAtlasStatus = useCallback(async () => {
    setIsCheckingAtlas(true);
    try {
      const res = await fetchAtlasStatus();
      if (res.success && res.data) {
        setAtlasStatus(res.data);
      } else {
        setAtlasStatus((prev) => ({
          isConnected: false,
          clusterHost: null,
          databaseName: null,
          error: res.message || 'Atlas status unavailable',
          lastPingMs: null,
          lastChecked: new Date().toISOString(),
        }));
      }
    } catch (e: any) {
      setAtlasStatus({
        isConnected: false,
        clusterHost: null,
        databaseName: null,
        error: e.message || 'Cannot connect to backend server',
        lastPingMs: null,
        lastChecked: new Date().toISOString(),
      });
    } finally {
      setIsCheckingAtlas(false);
    }
  }, []);

  // Check current session & Atlas health on mount
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      setIsLoading(true);
      await refreshAtlasStatus();

      const savedToken = localStorage.getItem(TOKEN_KEY);
      if (savedToken) {
        try {
          const res = await fetchCurrentUser();
          if (res.success && res.user && isMounted) {
            setUser(res.user);
            localStorage.setItem(USER_KEY, JSON.stringify(res.user));
          } else if (isMounted) {
            // Token is expired or invalid
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            setToken(null);
            setUser(null);
          }
        } catch {
          // Keep cached user if offline
        }
      }

      if (isMounted) {
        setIsLoading(false);
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [refreshAtlasStatus]);

  const openLoginModal = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setAuthModalMode('register');
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const openAtlasModal = () => {
    setIsAtlasModalOpen(true);
  };

  const closeAtlasModal = () => {
    setIsAtlasModalOpen(false);
  };

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await loginUser(email, password);
      if (res.success && res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem(TOKEN_KEY, res.token);
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        closeAuthModal();
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await registerUser(name, email, password);
      if (res.success && res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem(TOKEN_KEY, res.token);
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        closeAuthModal();
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const testUri = async (uri: string) => {
    setIsCheckingAtlas(true);
    try {
      const res = await testAtlasConnection(uri);
      if (res.data) {
        setAtlasStatus(res.data);
      }
      return res;
    } finally {
      setIsCheckingAtlas(false);
    }
  };

  const syncTrip = async (trip: TripPlan, expenses: Expense[]) => {
    if (!token) {
      openLoginModal();
      return { success: false, message: 'Please sign in to sync your trip with MongoDB Atlas.' };
    }
    return syncTripToAtlas(trip, expenses);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        atlasStatus,
        isCheckingAtlas,
        isAuthModalOpen,
        authModalMode,
        isAtlasModalOpen,
        openLoginModal,
        openRegisterModal,
        closeAuthModal,
        openAtlasModal,
        closeAtlasModal,
        login,
        register,
        logout,
        refreshAtlasStatus,
        testUri,
        syncTrip,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
