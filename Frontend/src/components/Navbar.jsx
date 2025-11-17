import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AppNavbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  console.log('AppNavbar: user:', user);
  console.log('AppNavbar: location:', location.pathname);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  if (!user) {
    console.log('AppNavbar: No user, returning null');
    return null;
  }

  console.log('AppNavbar: Rendering navbar for user:', user.full_name);

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/dashboard" className="fw-bold">
          ShadiSeva
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/dashboard" 
              active={isActive('/dashboard')}
            >
              Dashboard
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/services" 
              active={isActive('/services')}
            >
              Find Services
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/profile" 
              active={isActive('/profile')}
            >
              Profile
            </Nav.Link>
          </Nav>
          
          <Nav className="ms-auto">
            <Navbar.Text className="me-3">
              Welcome, {user.full_name}!
            </Navbar.Text>
            <Button 
              variant="outline-danger" 
              size="sm"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
