import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const UPLOAD_URL = import.meta.env.VITE_UPLOAD_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// ─── Auth Utilities ──────────────────────────────────────────────────────────
export const getToken = () => localStorage.getItem('token');
export const setToken = (token) => localStorage.setItem('token', token);
export const removeToken = () => localStorage.removeItem('token');
export const getUser = () => { const u = localStorage.getItem('user'); return u ? JSON.parse(u) : null; };
export const setUser = (user) => localStorage.setItem('user', JSON.stringify(user));
export const removeUser = () => localStorage.removeItem('user');
export const isAuthenticated = () => !!getToken();

// ─── Auth API ────────────────────────────────────────────────────────────────
export const authAPI = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  updateProfile: async (profileData) => {
    const res = await api.put('/auth/profile', profileData);
    return res.data;
  },
  updatePassword: async (passwordData) => {
    const res = await api.put('/auth/password', passwordData);
    return res.data;
  },
  logout: () => {
    removeToken();
    removeUser();
    window.location.href = '/login';
  }
};

// ─── Client API ──────────────────────────────────────────────────────────────
export const clientAPI = {
  getBookings: async () => {
    const res = await api.get('/client/bookings');
    if (res.data?.bookings) return { data: res.data.bookings };
    if (Array.isArray(res.data)) return { data: res.data };
    if (res.data?.data) return { data: res.data.data };
    return { data: [] };
  },
  cancelBooking: async (bookingId) => {
    const res = await api.patch(`/client/bookings/${bookingId}/cancel`);
    return res.data;
  },
  getServices: async (filters = {}) => {
    const res = await api.get('/client/services', { params: filters });
    if (res.data?.services) return { data: res.data.services };
    if (Array.isArray(res.data)) return { data: res.data };
    if (res.data?.data) return { data: res.data.data };
    return { data: [] };
  },
  bookService: async (bookingData) => {
    const res = await api.post('/client/book-service', bookingData);
    return res.data;
  }
};

// ─── Vendor API ──────────────────────────────────────────────────────────────
export const vendorAPI = {
  getProfile: async () => {
    const res = await api.get('/vendor/profile');
    return res.data;
  },
  getBookingRequests: async () => {
    const res = await api.get('/vendor/booking-requests');
    if (res.data?.data?.pending_bookings) return { data: res.data.data.pending_bookings };
    if (res.data?.pending_bookings) return { data: res.data.pending_bookings };
    if (Array.isArray(res.data)) return { data: res.data };
    return { data: [] };
  },
  getBookedServices: async () => {
    const res = await api.get('/vendor/booked-services');
    if (res.data?.data?.booked_services) return { data: res.data.data.booked_services };
    if (res.data?.booked_services) return { data: res.data.booked_services };
    if (Array.isArray(res.data)) return { data: res.data };
    return { data: [] };
  },
  getAllBookings: async () => {
    const res = await api.get('/vendor/bookings');
    if (res.data?.data?.bookings) return { data: res.data.data.bookings };
    if (res.data?.bookings) return { data: res.data.bookings };
    if (Array.isArray(res.data)) return { data: res.data };
    return { data: [] };
  },
  getMyServices: async () => {
    const res = await api.get('/vendor/my-services');
    if (res.data?.data?.services) return { data: res.data.data.services };
    if (res.data?.services) return { data: res.data.services };
    if (Array.isArray(res.data)) return { data: res.data };
    return { data: [] };
  },
  addService: async (formData) => {
    const res = await api.post('/vendor/services', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  updateService: async (serviceId, formData) => {
    const res = await api.put(`/vendor/services/${serviceId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  deleteService: async (serviceId) => {
    const res = await api.delete(`/vendor/services/${serviceId}`);
    return res.data;
  },
  changeBookingStatus: async (bookingId, status) => {
    const res = await api.patch(`/vendor/bookings/${bookingId}/status`, { status });
    return res.data;
  },
  getEarningsStats: async () => {
    const res = await api.get('/vendor/booked-services');
    return res.data;
  }
};

// ─── Admin API ───────────────────────────────────────────────────────────────
export const adminAPI = {
  getProfile: async () => {
    const res = await api.get('/admin/profile');
    return res.data;
  },
  getVendorRequests: async () => {
    const res = await api.get('/admin/vendor-requests');
    if (res.data?.data?.vendor_requests) return { data: res.data.data.vendor_requests };
    if (res.data?.vendor_requests) return { data: res.data.vendor_requests };
    if (Array.isArray(res.data)) return { data: res.data };
    return { data: [] };
  },
  acceptVendorRequest: async (vendorId) => {
    const res = await api.patch(`/admin/vendor-requests/${vendorId}/accept`);
    return res.data;
  },
  rejectVendorRequest: async (vendorId, reason) => {
    const res = await api.patch(`/admin/vendor-requests/${vendorId}/reject`, { reason });
    return res.data;
  },
  getAllUsers: async (filters = {}) => {
    const res = await api.get('/admin/users', { params: filters });
    if (res.data?.data?.users) return { data: res.data.data.users };
    if (res.data?.users) return { data: res.data.users };
    if (Array.isArray(res.data)) return { data: res.data };
    return { data: [] };
  },
  getAllBookings: async (filters = {}) => {
    const res = await api.get('/admin/bookings', { params: filters });
    if (res.data?.data?.bookings) return {
      data: res.data.data.bookings,
      pagination: res.data.data.pagination,
      total_revenue: res.data.data.total_revenue,
      status_count: res.data.data.status_count
    };
    if (res.data?.bookings) return { data: res.data.bookings };
    if (Array.isArray(res.data)) return { data: res.data };
    return { data: [] };
  },
  getStats: async () => {
    const res = await api.get('/admin/stats');
    return res.data;
  }
};

// ─── Review API ──────────────────────────────────────────────────────────────
export const reviewAPI = {
  addReview: async (serviceId, reviewData) => {
    const res = await api.post(`/reviews/${serviceId}`, reviewData);
    return res.data;
  },
  getServiceReviews: async (serviceId) => {
    const res = await api.get(`/reviews/${serviceId}`);
    return res.data;
  },
  getReviewableBookings: async () => {
    const res = await api.get('/reviews/my-reviewable');
    return res.data;
  }
};

// ─── UI Helpers ──────────────────────────────────────────────────────────────
export const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

export const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);

export const getStatusBadge = (status) => {
  if (!status || typeof status !== 'string') return { variant: 'warning', text: 'Pending' };
  const map = { pending: 'warning', confirmed: 'success', cancelled: 'danger', completed: 'info' };
  return { variant: map[status] || 'secondary', text: status.charAt(0).toUpperCase() + status.slice(1) };
};

export default api;
