import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const VendorNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  console.log("User : ", user)

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="app-navbar">
      <Container fluid>
        <Navbar.Brand as={Link} to="/vendor/dashboard" className="navbar-brand">
          <i className="fas fa-store me-2"></i>
          ShadiSeva Vendor
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link
              as={Link}
              to="/vendor/dashboard"
              className={isActive('/vendor/dashboard') ? 'active' : ''}
            >
              <i className="fas fa-tachometer-alt me-1"></i>
              Dashboard
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/vendor/services"
              className={isActive('/vendor/services') ? 'active' : ''}
            >
              <i className="fas fa-list me-1"></i>
              My Services
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/vendor/bookings"
              className={isActive('/vendor/bookings') ? 'active' : ''}
            >
              <i className="fas fa-calendar-alt me-1"></i>
              All Bookings
            </Nav.Link>
          </Nav>

          <Nav>
            {/* Verification Status Indicator */}
            {(user && !user?.verified) && (
              <Nav.Link className="text-warning">
                <i className="fas fa-exclamation-triangle me-1"></i>
                <small>Account Pending Verification</small>
              </Nav.Link>
            )}

            <NavDropdown
              title={
                <span>
                  <i className="fas fa-user-circle me-1"></i>
                  {user?.full_name || 'Vendor'}
                </span>
              }
              id="basic-nav-dropdown"
            >
              <NavDropdown.Item as={Link} to="/vendor/profile">
                <i className="fas fa-user me-2"></i>
                Profile
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>
                <i className="fas fa-sign-out-alt me-2"></i>
                Logout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default VendorNavbar;
