import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

const ROLE_ROUTES = { client: '/dashboard', vendor: '/vendor/dashboard', admin: '/admin/dashboard' };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      if (response.success) {
        const { token, user: userData } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        toast.success(`Welcome back, ${userData.full_name}!`);
        return { success: true, redirectTo: ROLE_ROUTES[userData.role] || '/dashboard' };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      if (response.success) {
        const { token, user: newUser } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
        toast.success(`Welcome to ShadiSeva, ${newUser.full_name}!`);
        return { success: true, redirectTo: ROLE_ROUTES[newUser.role] || '/dashboard' };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.info('You have been logged out.');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      if (response.success) {
        const updatedUser =
          response.data?.user ||
          response.data?.admin ||
          response.data?.client ||
          response.data?.vendor ||
          (response.data?.full_name ? response.data : null);

        if (!updatedUser) throw new Error('Unexpected response structure');

        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Profile update failed' };
    }
  };

  const updatePassword = async (passwordData) => {
    try {
      const response = await authAPI.updatePassword(passwordData);
      if (response.success) {
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Password update failed' };
    }
  };

  const isAuthenticated = user !== null && !!localStorage.getItem('token');

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, updatePassword, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
