import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuth, logout as logoutService } from '../services/auth';
import { User } from '../types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  canCreateSheet: () => boolean;
  canEditPage: () => boolean;
  isReadOnly: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const isAuthenticated = user !== null;

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await checkAuth();
        if (response.isAuthenticated && response.user) {
          setUser(response.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutService();
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [navigate]);

  const canCreateSheet = useCallback(() => {
    return user?.role === 'EDITOR' || user?.role === 'ADMIN';
  }, [user]);

  const canEditPage = useCallback(() => {
    return user?.role === 'EDITOR' || user?.role === 'ADMIN';
  }, [user]);

  const isReadOnly = useCallback(() => {
    return user?.role === 'READER';
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        setUser,
        logout,
        canCreateSheet,
        canEditPage,
        isReadOnly,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
