import axios from 'axios';

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const CLIENT_API_URL = `${API_BASE_URL}/client`;
const AUTH_API_URL = `${API_BASE_URL}/auth`;
const VENDOR_API_URL = `${API_BASE_URL}/vendor`;
const ADMIN_API_URL = `${API_BASE_URL}/admin`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('API Interceptor: Error response:', error.response?.status, error.response?.data);

    // Only handle 401 Unauthorized (authentication errors)
    // 403 Forbidden (authorization errors) should be handled by components
    if (error.response?.status === 401) {
      console.log('API Interceptor: 401 Unauthorized, logging out user');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // window.location.href = '/login';
    } else if (error.response?.status === 403) {
      console.log('API Interceptor: 403 Forbidden, letting component handle it');
    }
    return Promise.reject(error);
  }
);

// Utility functions
export const getToken = () => localStorage.getItem('token');
export const setToken = (token) => localStorage.setItem('token', token);
export const removeToken = () => localStorage.removeItem('token');

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const setUser = (user) => localStorage.setItem('user', JSON.stringify(user));
export const removeUser = () => localStorage.removeItem('user');

export const isAuthenticated = () => getToken() !== null;

// Auth API Functions
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post(`${AUTH_API_URL}/login`, credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post(`${AUTH_API_URL}/register`, userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get(`${AUTH_API_URL}/profile`);
    return response.data;
  },

  updateProfile: async (profileData) => {
    try {
      console.log('API: Updating profile with data:', profileData);
      console.log('API: Using endpoint:', `${AUTH_API_URL}/profile`);
      const response = await api.put(`${AUTH_API_URL}/profile`, profileData);
      console.log('API: Profile update response:', response);
      return response.data;
    } catch (error) {
      console.error('API: Error updating profile:', error);
      throw error;
    }
  },

  updatePassword: async (passwordData) => {
    const response = await api.put(`${AUTH_API_URL}/password`, passwordData);
    return response.data;
  },

  logout: () => {
    removeToken();
    removeUser();
    window.location.href = '/login';
  }
};

// Client API Functions
export const clientAPI = {
  getBookings: async () => {
    try {
      console.log('API: Fetching bookings from:', `${CLIENT_API_URL}/bookings`);
      const response = await api.get(`${CLIENT_API_URL}/bookings`);
      console.log('API: Bookings response:', response);

      // Handle different response formats
      if (response.data && response.data.bookings) {
        return { data: response.data.bookings };
      } else if (response.data && Array.isArray(response.data)) {
        return { data: response.data };
      } else if (response.data && response.data.data) {
        return { data: response.data.data };
      } else {
        return { data: [] };
      }
    } catch (error) {
      console.error('API: Error fetching bookings:', error);
      throw error;
    }
  },

  cancelBooking: async (bookingId) => {
    try {
      console.log('API: Cancelling booking:', bookingId);
      const response = await api.patch(`${CLIENT_API_URL}/bookings/${bookingId}/cancel`);
      console.log('API: Cancel booking response:', response);
      return response.data;
    } catch (error) {
      console.error('API: Error cancelling booking:', error);
      throw error;
    }
  },

  getServices: async (filters = {}) => {
    try {
      console.log('API: Fetching services with filters:', filters);
      const response = await api.get(`${CLIENT_API_URL}/services`, { params: filters });
      console.log('API: Services response:', response);

      // Handle different response formats
      if (response.data && response.data.services) {
        return { data: response.data.services };
      } else if (response.data && Array.isArray(response.data)) {
        return { data: response.data };
      } else if (response.data && response.data.data) {
        return { data: response.data.data };
      } else {
        return { data: [] };
      }
    } catch (error) {
      console.error('API: Error fetching services:', error);
      throw error;
    }
  },

  bookService: async (bookingData) => {
    try {
      console.log('API: Booking service with data:', bookingData);
      console.log('API: Data type:', typeof bookingData);
      console.log('API: Data stringified:', JSON.stringify(bookingData));

      const response = await api.post(`${CLIENT_API_URL}/book-service`, bookingData);
      console.log('API: Book service response:', response);
      return response.data;
    } catch (error) {
      console.error('API: Error booking service:', error);
      console.error('API: Error response:', error.response?.data);
      throw error;
    }
  }
};

// Vendor API Functions
export const vendorAPI = {
  // Get vendor profile
  getProfile: async () => {
    try {
      console.log('API: Fetching vendor profile from:', `${VENDOR_API_URL}/profile`);
      const response = await api.get(`${VENDOR_API_URL}/profile`);
      console.log('API: Vendor profile response:', response);
      return response.data;
    } catch (error) {
      console.error('API: Error fetching vendor profile:', error);
      throw error;
    }
  },

  // Get booking requests (pending bookings)
  getBookingRequests: async () => {
    try {
      console.log('API: Fetching booking requests from:', `${VENDOR_API_URL}/booking-requests`);
      const response = await api.get(`${VENDOR_API_URL}/booking-requests`);
      console.log('API: Booking requests response:', response);

      // Handle different response formats
      if (response.data && response.data.data && response.data.data.pending_bookings) {
        return { data: response.data.data.pending_bookings };
      } else if (response.data && response.data.pending_bookings) {
        return { data: response.data.pending_bookings };
      } else if (response.data && Array.isArray(response.data)) {
        return { data: response.data };
      } else {
        return { data: [] };
      }
    } catch (error) {
      console.error('API: Error fetching booking requests:', error);
      throw error;
    }
  },

  // Get booked services (current/future bookings)
  getBookedServices: async () => {
    try {
      console.log('API: Fetching booked services from:', `${VENDOR_API_URL}/booked-services`);
      const response = await api.get(`${VENDOR_API_URL}/booked-services`);
      console.log('API: Booked services response:', response);

      // Handle different response formats
      if (response.data && response.data.data && response.data.data.booked_services) {
        return { data: response.data.data.booked_services };
      } else if (response.data && response.data.booked_services) {
        return { data: response.data.booked_services };
      } else if (response.data && Array.isArray(response.data)) {
        return { data: response.data };
      } else {
        return { data: [] };
      }
    } catch (error) {
      console.error('API: Error fetching booked services:', error);
      throw error;
    }
  },

  // Get all bookings (for all bookings page)
  getAllBookings: async () => {
    try {
      console.log('API: Fetching all bookings from:', `${VENDOR_API_URL}/bookings`);
      const response = await api.get(`${VENDOR_API_URL}/bookings`);
      console.log('API: All bookings response:', response);

      // Handle different response formats
      if (response.data && response.data.data && response.data.data.bookings) {
        return { data: response.data.data.bookings };
      } else if (response.data && response.data.bookings) {
        return { data: response.data.bookings };
      } else if (response.data && Array.isArray(response.data)) {
        return { data: response.data };
      } else {
        return { data: [] };
      }
    } catch (error) {
      console.error('API: Error fetching all bookings:', error);
      throw error;
    }
  },

  // Get vendor's services
  getMyServices: async () => {
    try {
      console.log('API: Fetching vendor services from:', `${VENDOR_API_URL}/my-services`);
      const response = await api.get(`${VENDOR_API_URL}/my-services`);
      console.log('API: Vendor services response:', response);

      // Handle different response formats
      if (response.data && response.data.data && response.data.data.services) {
        return { data: response.data.data.services };
      } else if (response.data && response.data.services) {
        return { data: response.data.services };
      } else if (response.data && Array.isArray(response.data)) {
        return { data: response.data };
      } else {
        return { data: [] };
      }
    } catch (error) {
      console.error('API: Error fetching vendor services:', error);
      throw error;
    }
  },

  // Add new service
  addService: async (serviceData) => {
    try {
      console.log('API: Adding new service to:', `${VENDOR_API_URL}/services`);
      const response = await api.post(`${VENDOR_API_URL}/services`, serviceData);
      console.log('API: Add service response:', response);
      return response.data;
    } catch (error) {
      console.error('API: Error adding service:', error);
      throw error;
    }
  },

  // Update service
  updateService: async (serviceId, serviceData) => {
    try {
      console.log('API: Updating service:', `${VENDOR_API_URL}/services/${serviceId}`);
      const response = await api.put(`${VENDOR_API_URL}/services/${serviceId}`, serviceData);
      console.log('API: Update service response:', response);
      return response.data;
    } catch (error) {
      console.error('API: Error updating service:', error);
      throw error;
    }
  },

  // Delete service
  deleteService: async (serviceId) => {
    try {
      console.log('API: Deleting service:', `${VENDOR_API_URL}/services/${serviceId}`);
      const response = await api.delete(`${VENDOR_API_URL}/services/${serviceId}`);
      console.log('API: Delete service response:', response);
      return response.data;
    } catch (error) {
      console.error('API: Error deleting service:', error);
      throw error;
    }
  },

  // Change booking status
  changeBookingStatus: async (bookingId, status) => {
    try {
      console.log('API: Changing booking status:', `${VENDOR_API_URL}/bookings/${bookingId}/status`);
      console.log('API: Booking ID:', bookingId);
      console.log('API: New status:', status);
      console.log('API: Request payload:', { status });

      const response = await api.patch(`${VENDOR_API_URL}/bookings/${bookingId}/status`, { status });
      console.log('API: Change booking status response:', response);
      return response.data;
    } catch (error) {
      console.error('API: Error changing booking status:', error);
      console.error('API: Error response:', error.response?.data);
      console.error('API: Error status:', error.response?.status);
      throw error;
    }
  }
};

// Admin API Functions
export const adminAPI = {
  // Get admin profile
  getProfile: async () => {
    try {
      console.log('API: Fetching admin profile from:', `${ADMIN_API_URL}/profile`);
      const response = await api.get(`${ADMIN_API_URL}/profile`);
      console.log('API: Admin profile response:', response);
      return response.data;
    } catch (error) {
      console.error('API: Error fetching admin profile:', error);
      throw error;
    }
  },



  // Get vendor requests (unverified vendors)
  getVendorRequests: async () => {
    try {
      console.log('API: Fetching vendor requests from:', `${ADMIN_API_URL}/vendor-requests`);
      const response = await api.get(`${ADMIN_API_URL}/vendor-requests`);
      console.log('API: Vendor requests response:', response);

      // Handle different response formats
      if (response.data && response.data.data && response.data.data.vendor_requests) {
        return { data: response.data.data.vendor_requests };
      } else if (response.data && response.data.vendor_requests) {
        return { data: response.data.vendor_requests };
      } else if (response.data && Array.isArray(response.data)) {
        return { data: response.data };
      } else {
        return { data: [] };
      }
    } catch (error) {
      console.error('API: Error fetching vendor requests:', error);
      throw error;
    }
  },

  // Accept vendor request
  acceptVendorRequest: async (vendorId) => {
    try {
      console.log('API: Accepting vendor request:', `${ADMIN_API_URL}/vendor-requests/${vendorId}/accept`);
      const response = await api.patch(`${ADMIN_API_URL}/vendor-requests/${vendorId}/accept`);
      console.log('API: Accept vendor request response:', response);
      return response.data;
    } catch (error) {
      console.error('API: Error accepting vendor request:', error);
      throw error;
    }
  },

  // Get all users with filtering
  getAllUsers: async (filters = {}) => {
    try {
      console.log('API: Fetching all users with filters:', filters);
      const response = await api.get(`${ADMIN_API_URL}/users`, { params: filters });
      console.log('API: All users response:', response);

      // Handle different response formats
      if (response.data && response.data.data && response.data.data.users) {
        return {
          data: response.data.data.users,
        };
      } else if (response.data && response.data.users) {
        return {
          data: response.data.users,
        };
      } else if (response.data && Array.isArray(response.data)) {
        return { data: response.data };
      } else {
        return { data: [] };
      }
    } catch (error) {
      console.error('API: Error fetching all users:', error);
      throw error;
    }
  },

  // Get all bookings with filtering
  getAllBookings: async (filters = {}) => {
    try {
      console.log('API: Fetching all bookings with filters:', filters);
      const response = await api.get(`${ADMIN_API_URL}/bookings`, { params: filters });
      console.log('API: All bookings response:', response);

      // Handle different response formats
      if (response.data && response.data.data && response.data.data.bookings) {
        return {
          data: response.data.data.bookings,
          pagination: response.data.data.pagination,
          total_revenue: response.data.data.total_revenue,
          status_count: response.data.data.status_count
        };
      } else if (response.data && response.data.bookings) {
        return {
          data: response.data.bookings,
          pagination: response.data.pagination
        };
      } else if (response.data && Array.isArray(response.data)) {
        return { data: response.data };
      } else {
        return { data: [] };
      }
    } catch (error) {
      console.error('API: Error fetching all bookings:', error);
      throw error;
    }
  }
};

// UI Helper Functions
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(price);
};

export const getStatusBadge = (status) => {
  // Handle undefined, null, or empty status
  if (!status || typeof status !== 'string') {
    return {
      variant: 'secondary',
      text: 'Unknown'
    };
  }

  const statusClasses = {
    'pending': 'warning',
    'confirmed': 'success',
    'cancelled': 'danger',
    'completed': 'info'
  };

  return {
    variant: statusClasses[status] || 'secondary',
    text: status.charAt(0).toUpperCase() + status.slice(1)
  };
};

export default api;
