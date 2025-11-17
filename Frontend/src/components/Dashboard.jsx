import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { clientAPI } from '../services/api';
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Dashboard: user:', user);
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      console.log('Dashboard: Fetching bookings...');
      setLoading(true);
      setError('');

      const response = await clientAPI.getBookings();
      console.log('Dashboard: Bookings response:', response);

      // Ensure bookings is always an array
      let bookingsData = [];
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          bookingsData = response.data;
        } else if (response.data.bookings && Array.isArray(response.data.bookings)) {
          bookingsData = response.data.bookings;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          bookingsData = response.data.data;
        } else {
          console.warn('Dashboard: Unexpected bookings data format:', response.data);
          bookingsData = [];
        }
      }

      console.log('Dashboard: Processed bookings data:', bookingsData);
      setBookings(bookingsData);
    } catch (err) {
      console.error('Dashboard: Error fetching bookings:', err);
      setError(err.response?.data?.message || 'Failed to fetch bookings. Please check if the backend server is running.');
      setBookings([]); // Ensure bookings is an empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await clientAPI.cancelBooking(bookingId);
      fetchBookings(); // Refresh the list
    } catch (err) {
      setError('Failed to cancel booking');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      confirmed: 'success',
      completed: 'primary',
      cancelled: 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status.toUpperCase()}</Badge>;
  };

  // Ensure bookings is always an array for filtering
  const bookingsArray = Array.isArray(bookings) ? bookings : [];

  console.log('Dashboard: Rendering with loading:', loading, 'error:', error, 'bookings:', bookingsArray);

  if (loading) {
    return (
      <div className="dashboard-page">
        <Container fluid className="h-100">
          <Row className="h-100 align-items-center justify-content-center">
            <Col xs={12} className="text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-3">Loading your dashboard...</p>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Container fluid className="h-100">
        {/* Hero Section */}
        <Row className="hero-section mb-5">
          <Col xs={12}>
            <div className="hero-content text-center">
              <h1 className="hero-title">Welcome back, {user?.full_name}!</h1>
              <p className="hero-subtitle">Manage your wedding service bookings</p>
            </div>
          </Col>
        </Row>

        {/* Error Alert */}
        {error && (
          <Row className="mb-4">
            <Col xs={12}>
              <Alert variant="danger" dismissible onClose={() => setError('')}>
                <h5>Error Loading Dashboard</h5>
                <p>{error}</p>
                <hr />
                <p className="mb-0">
                  <strong>Troubleshooting:</strong>
                  <br />
                  1. Make sure your backend server is running on http://localhost:5000
                  <br />
                  2. Check the browser console for more details
                  <br />
                  3. Try refreshing the page
                </p>
              </Alert>
            </Col>
          </Row>
        )}

        {/* Stats Section */}
        <Row className="mb-4 widgets-section">
          <Col xs={12} md={3}>
            <Card className="stats-card text-center">
              <Card.Body>
                <h3 className="stats-number">{bookingsArray.length}</h3>
                <p className="stats-label">Total Bookings</p>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={3}>
            <Card className="stats-card text-center">
              <Card.Body>
                <h3 className="stats-number">
                  {bookingsArray.filter(b => b.status === 'pending').length}
                </h3>
                <p className="stats-label">Pending</p>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={3}>
            <Card className="stats-card text-center">
              <Card.Body>
                <h3 className="stats-number">
                  {bookingsArray.filter(b => b.status === 'confirmed').length}
                </h3>
                <p className="stats-label">Confirmed</p>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={3}>
            <Card className="stats-card text-center">
              <Card.Body>
                <h3 className="stats-number">
                  {bookingsArray.filter(b => b.status === 'completed').length}
                </h3>
                <p className="stats-label">Completed</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Bookings Section */}
        <Row className='dashboard-bookings-section '>
          <Col xs={12}>
            <Card>
              <Card.Header>
                <h2 className="section-title mb-0">My Bookings</h2>
              </Card.Header>
              <Card.Body>
                {bookingsArray.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                    <h4 className="text-muted">No bookings yet</h4>
                    <p className="text-muted">Start by exploring our services</p>
                    <Button
                      variant="primary"
                      onClick={() => navigate('/services')}
                    >
                      Browse Services
                    </Button>
                  </div>
                ) : (
                  <Row>
                    {bookingsArray.map((booking) => (
                      <Col xs={12} md={6} lg={4} key={booking._id || booking.booking_id} className="mb-3">
                        <Card className="booking-card h-100">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h5 className="booking-service">{booking.service?.name || booking.service?.title || 'Unknown Service'}</h5>
                              {getStatusBadge(booking.status)}
                            </div>
                            <p className="booking-vendor text-muted">
                              <i className="fas fa-user-tie me-2"></i>
                              {booking.vendor?.full_name || 'Unknown Vendor'}
                            </p>
                            <p className="booking-date">
                              <i className="fas fa-calendar me-2"></i>
                              {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : 'Date not set'}
                            </p>
                            <p className="booking-price">
                              <i className="fas fa-rupee-sign me-2"></i>
                              {booking.service?.price || booking.total_amount || 'Price not available'}
                            </p>
                            {booking.status === 'pending' && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleCancelBooking(booking._id || booking.booking_id)}
                                className="w-100"
                              >
                                <i className="fas fa-times me-2"></i>
                                Cancel Booking
                              </Button>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard;
