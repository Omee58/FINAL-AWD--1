import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";

const AdminNavbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    authAPI.logout();
    logout();
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="admin-navbar">
      <Container fluid>
        <Navbar.Brand as={Link} to="/admin/dashboard" className="fw-bold">
          <i className="fas fa-shield-alt me-2"></i>
          Admin Panel
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="admin-navbar-nav" />
        <Navbar.Collapse id="admin-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/admin/dashboard">
              <i className="fas fa-tachometer-alt me-1"></i>
              Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/admin/profile">
              <i className="fas fa-user me-1"></i>
              Profile
            </Nav.Link>
            <Nav.Link as={Link} to="/admin/users">
              <i className="fas fa-users me-1"></i>
              All Users
            </Nav.Link>
            <Nav.Link as={Link} to="/admin/bookings">
              <i className="fas fa-calendar-alt me-1"></i>
              All Bookings
            </Nav.Link>
          </Nav>

          <Nav className="ms-auto">
            <Navbar.Text className="me-3">
              <i className="fas fa-user-shield me-1"></i>
              {user?.full_name || "Admin"}
            </Navbar.Text>
            <Button variant="outline-light" size="sm" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt me-1"></i>
              Logout
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AdminNavbar;
