export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  createdAt: string;
  lastLogin?: string;
}

export interface AtlasStatus {
  isConnected: boolean;
  clusterHost: string | null;
  databaseName: string | null;
  error: string | null;
  lastPingMs: number | null;
  lastChecked: string | null;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  isDbOffline?: boolean;
  error?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
