import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppNavbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Services from './components/Services';

// Vendor Components
import VendorNavbar from './components/vendor/VendorNavbar';
import VendorDashboard from './components/vendor/VendorDashboard';
import VendorProfile from './components/vendor/VendorProfile';
import VendorServices from './components/vendor/VendorServices';
import VendorAllBookings from './components/vendor/VendorAllBookings';

// Admin Components
import AdminNavbar from './components/admin/AdminNavbar';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminProfile from './components/admin/AdminProfile';
import AdminAllUsers from './components/admin/AdminAllUsers';
import AdminAllBookings from './components/admin/AdminAllBookings';

// Pages
import LandingPage from './pages/LandingPage';
import ServiceDetail from './pages/ServiceDetail';
import NotFound from './pages/NotFound';
import ChatbotWidget from './components/ChatbotWidget';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const ClientLayout = ({ children }) => (
  <>
    <AppNavbar />
    {children}
    <Footer />
  </>
);

const VendorLayout = ({ children }) => (
  <>
    <VendorNavbar />
    {children}
    <Footer />
  </>
);

const AdminLayout = ({ children }) => (
  <>
    <AdminNavbar />
    {children}
    <Footer />
  </>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/services/:serviceId" element={<><AppNavbar /><ServiceDetail /><Footer /></>} />

            {/* Client */}
            <Route path="/dashboard" element={
              <ClientLayout>
                <ProtectedRoute allowedRoles={['client']}><Dashboard /></ProtectedRoute>
              </ClientLayout>
            } />
            <Route path="/profile" element={
              <ClientLayout>
                <ProtectedRoute allowedRoles={['client']}><Profile /></ProtectedRoute>
              </ClientLayout>
            } />
            <Route path="/services" element={
              <ClientLayout>
                <ProtectedRoute allowedRoles={['client']}><Services /></ProtectedRoute>
              </ClientLayout>
            } />

            {/* Vendor */}
            <Route path="/vendor/dashboard" element={
              <VendorLayout>
                <ProtectedRoute allowedRoles={['vendor']}><VendorDashboard /></ProtectedRoute>
              </VendorLayout>
            } />
            <Route path="/vendor/profile" element={
              <VendorLayout>
                <ProtectedRoute allowedRoles={['vendor']}><VendorProfile /></ProtectedRoute>
              </VendorLayout>
            } />
            <Route path="/vendor/services" element={
              <VendorLayout>
                <ProtectedRoute allowedRoles={['vendor']}><VendorServices /></ProtectedRoute>
              </VendorLayout>
            } />
            <Route path="/vendor/bookings" element={
              <VendorLayout>
                <ProtectedRoute allowedRoles={['vendor']}><VendorAllBookings /></ProtectedRoute>
              </VendorLayout>
            } />

            {/* Admin */}
            <Route path="/admin/dashboard" element={
              <AdminLayout>
                <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
              </AdminLayout>
            } />
            <Route path="/admin/profile" element={
              <AdminLayout>
                <ProtectedRoute allowedRoles={['admin']}><AdminProfile /></ProtectedRoute>
              </AdminLayout>
            } />
            <Route path="/admin/users" element={
              <AdminLayout>
                <ProtectedRoute allowedRoles={['admin']}><AdminAllUsers /></ProtectedRoute>
              </AdminLayout>
            } />
            <Route path="/admin/bookings" element={
              <AdminLayout>
                <ProtectedRoute allowedRoles={['admin']}><AdminAllBookings /></ProtectedRoute>
              </AdminLayout>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <ChatbotWidget />
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover />
      </Router>
    </AuthProvider>
  );
}

export default App;
