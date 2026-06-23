import { useCallback } from 'react';
import { useAuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const { user, login, register, logout, loading, error } = useAuthContext();

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isAnalyst = user?.role === 'analyst' || user?.role === 'admin';

  const requireAuth = useCallback(() => {
    if (!isAuthenticated) {
      throw new Error('Authentication required');
    }
  }, [isAuthenticated]);

  return {
    user,
    login,
    register,
    logout,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isAnalyst,
    requireAuth,
  };
};
