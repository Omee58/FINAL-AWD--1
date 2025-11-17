import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { globalNavigate } from '../App';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redirectPath, setRedirectPath] = useState(null);

  useEffect(() => {
    console.log('AuthContext: useEffect running, checking for existing auth...');
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    console.log('AuthContext: Found token:', !!token);
    console.log('AuthContext: Found savedUser:', !!savedUser);
    
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('AuthContext: Parsed user:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('AuthContext: Error parsing saved user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    setLoading(false);
    console.log('AuthContext: Initialization complete');
  }, []);

  // Handle redirect when redirectPath changes
  useEffect(() => {
    console.log('AuthContext: Redirect effect triggered - redirectPath:', redirectPath, 'user:', user);
    if (redirectPath && user) {
      console.log('AuthContext: Redirecting to:', redirectPath);
      // window.location.href = redirectPath;
      globalNavigate(redirectPath)
      setRedirectPath(null); // Reset after redirect
    }
  }, [redirectPath, user]);

  const login = async (credentials) => {
    try {
      console.log('AuthContext: Starting login process...');
      const response = await authAPI.login(credentials);
      console.log('AuthContext: Login response:', response);
      
      if (response.success) {
        const { token, user: userData } = response.data;
        console.log('AuthContext: Login successful, user data:', userData);
        
        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('AuthContext: Token and user data stored in localStorage');
        
        setUser(userData);
        console.log('AuthContext: User state updated to:', userData);
        
        // Set redirect path based on user role
        const roleRoutes = {
          client: '/dashboard',
          vendor: '/vendor/dashboard',
          admin: '/admin/dashboard'
        };
        
        const path = roleRoutes[userData.role] || '/dashboard';
        console.log('AuthContext: Setting redirect path to:', path);
        setRedirectPath(path);
        
        return { success: true };
      } else {
        console.log('AuthContext: Login failed:', response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      if (response.success) {
        const { token, user: newUser } = response.data;
        
        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(newUser));
        
        setUser(newUser);
        
        // Set redirect path based on user role
        const roleRoutes = {
          client: '/dashboard',
          vendor: '/vendor/dashboard',
          admin: '/admin/dashboard'
        };
        
        const path = roleRoutes[newUser.role] || '/dashboard';
        console.log('AuthContext: Setting redirect path to:', path);
        setRedirectPath(path);
        
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      console.log('AuthContext: Updating profile with data:', profileData);
      const response = await authAPI.updateProfile(profileData);
      console.log('AuthContext: Profile update response:', response);
      
      if (response.success) {
        // Handle different response structures
        let updatedUser;
        if (response.data && response.data.user) {
          updatedUser = response.data.user;
        } else if (response.data && response.data.admin) {
          updatedUser = response.data.admin;
        } else if (response.data && response.data.client) {
          updatedUser = response.data.client;
        } else if (response.data && response.data.vendor) {
          updatedUser = response.data.vendor;
        } else if (response.data && typeof response.data === 'object' && response.data.full_name) {
          // Direct user object
          updatedUser = response.data;
        } else {
          console.error('AuthContext: Unexpected response structure:', response);
          throw new Error('Unexpected response structure from server');
        }
        
        console.log('AuthContext: Extracted updated user:', updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Profile update failed' 
      };
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
      console.error('Password update error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Password update failed' 
      };
    }
  };

  const isAuthenticated = user !== null && localStorage.getItem('token') !== null;
  
  console.log('AuthContext: isAuthenticated calculated:', isAuthenticated, 'user:', user, 'token:', !!localStorage.getItem('token'));

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    isAuthenticated,
    redirectPath
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
