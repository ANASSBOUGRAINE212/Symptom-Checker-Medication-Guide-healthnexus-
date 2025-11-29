import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  emailAddresses: any;
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = 'http://localhost:5174/api/v1';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setAccessToken(token);
      fetchCurrentUser(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchCurrentUser = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data.user);
      } else {
        localStorage.removeItem('accessToken');
        setAccessToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('accessToken');
      setAccessToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, firstName?: string, lastName?: string) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, firstName, lastName })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    return data;
  };

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, rememberMe })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    // Save tokens
    setAccessToken(data.data.accessToken);
    localStorage.setItem('accessToken', data.data.accessToken);
    setUser(data.data.user);
  };

  // Logout user
  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    // Clear local state
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem('accessToken');
  };

  // Refresh access token
  const refreshToken = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setAccessToken(data.data.accessToken);
        localStorage.setItem('accessToken', data.data.accessToken);
      } else {
        // Refresh failed, logout
        await logout();
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
    }
  };

  // Auto-refresh token before it expires (every 14 minutes, token expires in 15)
  useEffect(() => {
    if (accessToken) {
      const interval = setInterval(() => {
        refreshToken();
      }, 14 * 60 * 1000); // 14 minutes

      return () => clearInterval(interval);
    }
  }, [accessToken]);

  const value = {
    user,
    accessToken,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
