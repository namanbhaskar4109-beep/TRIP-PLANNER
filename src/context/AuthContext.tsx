import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AtlasStatus, AuthResponse, ForgotPasswordResponse, ResetPasswordResponse } from '../types/auth';
import {
  loginUser,
  registerUser,
  logoutUser,
  fetchCurrentUser,
  requestForgotPassword,
  resetPassword,
  fetchAtlasStatus,
  testAtlasConnection,
  syncTripToAtlas,
} from '../services/apiClient';
import { TripPlan, Expense } from '../types/trip';

export type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-password';

const TOKEN_KEY = 'trip_planner_auth_token';
const USER_KEY = 'trip_planner_auth_user';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  atlasStatus: AtlasStatus | null;
  isCheckingAtlas: boolean;
  isAuthModalOpen: boolean;
  authModalMode: AuthMode;
  resetTokenParam: string;
  currentPath: string;
  navigateTo: (path: string) => void;
  openLoginModal: () => void;
  openRegisterModal: () => void;
  openForgotPasswordModal: () => void;
  openResetPasswordModal: (token?: string) => void;
  closeAuthModal: () => void;
  openAtlasModal: () => void;
  closeAtlasModal: () => void;
  isAtlasModalOpen: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (name: string, email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<ForgotPasswordResponse>;
  resetUserPassword: (token: string, password: string) => Promise<ResetPasswordResponse>;
  refreshAtlasStatus: () => Promise<void>;
  testUri: (uri: string) => Promise<{ success: boolean; message: string; data?: AtlasStatus }>;
  syncTrip: (trip: TripPlan, expenses: Expense[]) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [atlasStatus, setAtlasStatus] = useState<AtlasStatus | null>(null);
  const [isCheckingAtlas, setIsCheckingAtlas] = useState<boolean>(false);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthMode>('login');
  const [resetTokenParam, setResetTokenParam] = useState<string>('');
  const [isAtlasModalOpen, setIsAtlasModalOpen] = useState(false);

  // Track browser path for URL-based navigation
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const navigateTo = useCallback((path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
  }, []);

  // Listen to popstate (back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Check URL parameters on mount (e.g. /reset-password?token=xxx)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      setResetTokenParam(token);
    }
  }, []);

  const refreshAtlasStatus = useCallback(async () => {
    setIsCheckingAtlas(true);
    try {
      const res = await fetchAtlasStatus();
      if (res.success && res.data) {
        setAtlasStatus(res.data);
      } else {
        setAtlasStatus({
          isConnected: false,
          clusterHost: null,
          databaseName: null,
          error: res.message || 'Atlas status unavailable',
          lastPingMs: null,
          lastChecked: new Date().toISOString(),
        });
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

  // Verify authentication session via HttpOnly cookie or token on mount
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      setIsLoading(true);
      await refreshAtlasStatus();

      try {
        const res = await fetchCurrentUser();
        if (res.success && res.user && isMounted) {
          setUser(res.user);
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        } else if (isMounted && res.success === false && !res.isDbOffline) {
          // Token is definitively invalid or expired
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setUser(null);
        }
      } catch {
        // Keep cached state if network issue
      } finally {
        if (isMounted) setIsLoading(false);
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

  const openForgotPasswordModal = () => {
    setAuthModalMode('forgot-password');
    setIsAuthModalOpen(true);
  };

  const openResetPasswordModal = (token?: string) => {
    if (token) setResetTokenParam(token);
    setAuthModalMode('reset-password');
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
      if (res.success && res.user) {
        setUser(res.user);
        if (res.token) {
          localStorage.setItem(TOKEN_KEY, res.token);
        }
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        closeAuthModal();
        if (currentPath === '/login' || currentPath === '/signup') {
          navigateTo('/');
        }
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
      if (res.success && res.user) {
        setUser(res.user);
        if (res.token) {
          localStorage.setItem(TOKEN_KEY, res.token);
        }
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        closeAuthModal();
        if (currentPath === '/login' || currentPath === '/signup') {
          navigateTo('/');
        }
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // Clean up local state regardless of network response
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const forgotPassword = async (email: string): Promise<ForgotPasswordResponse> => {
    return requestForgotPassword(email);
  };

  const resetUserPassword = async (token: string, password: string): Promise<ResetPasswordResponse> => {
    return resetPassword(token, password);
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
    if (!user) {
      openLoginModal();
      return { success: false, message: 'Please sign in to sync your trip with MongoDB Atlas.' };
    }
    return syncTripToAtlas(trip, expenses);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        atlasStatus,
        isCheckingAtlas,
        isAuthModalOpen,
        authModalMode,
        resetTokenParam,
        currentPath,
        navigateTo,
        openLoginModal,
        openRegisterModal,
        openForgotPasswordModal,
        openResetPasswordModal,
        closeAuthModal,
        openAtlasModal,
        closeAtlasModal,
        isAtlasModalOpen,
        login,
        register,
        logout,
        forgotPassword,
        resetUserPassword,
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
