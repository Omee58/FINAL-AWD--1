import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { useNavigate } from "react-router-dom";

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

let globalNavigate;

function NavigationBinder() {
  globalNavigate = useNavigate();
  return null;
}

export { globalNavigate };

function App() {
  return (
    <AuthProvider>
      <Router>
        <NavigationBinder />
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Client Routes */}
            <Route
              path="/dashboard"
              element={
                <>
                  <AppNavbar />
                  <ProtectedRoute allowedRoles={['client']}>
                    <Dashboard />
                  </ProtectedRoute>
                  <Footer />
                </>
              }
            />
            <Route
              path="/profile"
              element={
                <>
                  <AppNavbar />
                  <ProtectedRoute allowedRoles={['client']}>
                    <Profile />
                  </ProtectedRoute>
                  <Footer />
                </>
              }
            />
            <Route
              path="/services"
              element={
                <>
                  <AppNavbar />
                  <ProtectedRoute allowedRoles={['client']}>
                    <Services />
                  </ProtectedRoute>
                  <Footer />
                </>
              }
            />

            {/* Vendor Routes */}
            <Route
              path="/vendor/dashboard"
              element={
                <>
                  <VendorNavbar />
                  <ProtectedRoute allowedRoles={['vendor']}>
                    <VendorDashboard />
                  </ProtectedRoute>
                  <Footer />
                </>
              }
            />
            <Route
              path="/vendor/profile"
              element={
                <>
                  <VendorNavbar />
                  <ProtectedRoute allowedRoles={['vendor']}>
                    <VendorProfile />
                  </ProtectedRoute>
                  <Footer />
                </>
              }
            />
            <Route
              path="/vendor/services"
              element={
                <>
                  <VendorNavbar />
                  <ProtectedRoute allowedRoles={['vendor']}>
                    <VendorServices />
                  </ProtectedRoute>
                  <Footer />
                </>
              }
            />
            <Route
              path="/vendor/bookings"
              element={
                <>
                  <VendorNavbar />
                  <ProtectedRoute allowedRoles={['vendor']}>
                    <VendorAllBookings />
                  </ProtectedRoute>
                  <Footer />
                </>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <>
                  <AdminNavbar />
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                  <Footer />
                </>
              }
            />
            <Route
              path="/admin/profile"
              element={
                <>
                  <AdminNavbar />
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminProfile />
                  </ProtectedRoute>
                  <Footer />
                </>
              }
            />
            <Route
              path="/admin/users"
              element={
                <>
                  <AdminNavbar />
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminAllUsers />
                  </ProtectedRoute>
                  <Footer />
                </>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <>
                  <AdminNavbar />
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminAllBookings />
                  </ProtectedRoute>
                  <Footer />
                </>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
