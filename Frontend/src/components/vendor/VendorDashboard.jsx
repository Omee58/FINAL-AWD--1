import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner, Modal } from 'react-bootstrap';
import { vendorAPI, formatDate, formatPrice, getStatusBadge } from '../../services/api';

const VendorDashboard = () => {
  const [bookingRequests, setBookingRequests] = useState([]);
  const [bookedServices, setBookedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [statusSuccess, setStatusSuccess] = useState('');

  useEffect(() => {
    console.log('VendorDashboard: Component mounted, fetching data...');
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('VendorDashboard: Fetching dashboard data...');
      setLoading(true);
      setError('');

      // Fetch both booking requests and booked services
      const [requestsResponse, bookedResponse] = await Promise.all([
        vendorAPI.getBookingRequests(),
        vendorAPI.getBookedServices()
      ]);

      console.log('VendorDashboard: Booking requests response:', requestsResponse);
      console.log('VendorDashboard: Booked services response:', bookedResponse);

      // Ensure data is always arrays
      const requestsData = Array.isArray(requestsResponse.data) ? requestsResponse.data : [];
      const bookedData = Array.isArray(bookedResponse.data) ? bookedResponse.data : [];

      console.log('VendorDashboard: Processing requestsData:', requestsData);
      console.log('VendorDashboard: Processing bookedData:', bookedData);

      // Log each booking to see the structure
      requestsData.forEach((booking, index) => {
        console.log(`VendorDashboard: Booking request ${index}:`, booking);
        console.log(`VendorDashboard: Booking request ${index} status:`, booking.status);
      });

      bookedData.forEach((booking, index) => {
        console.log(`VendorDashboard: Booked service ${index}:`, booking);
        console.log(`VendorDashboard: Booked service ${index} status:`, booking.status);
      });

      setBookingRequests(requestsData);
      setBookedServices(bookedData.filter(b=> b.status !== "pending"));
    } catch (err) {
      console.error('VendorDashboard: Error fetching dashboard data:', err);
      
      // Handle 403 Forbidden (unverified vendor)
      if (err.response?.status === 403) {
        setError('Your vendor account needs to be verified by an administrator before you can access the dashboard. Please contact the admin or wait for verification.');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch dashboard data. Please check if the backend server is running.');
      }
      
      setBookingRequests([]);
      setBookedServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (booking, newStatus) => {
    setSelectedBooking({...booking, newStatus});
    setShowStatusModal(true);
    setStatusError('');
    setStatusSuccess('');
  };

  const confirmStatusChange = async () => {
    if (!selectedBooking) return;

    console.log('VendorDashboard: confirmStatusChange called');
    console.log('VendorDashboard: selectedBooking:', selectedBooking);
    console.log('VendorDashboard: booking_id:', selectedBooking.booking_id || selectedBooking._id);
    console.log('VendorDashboard: newStatus:', selectedBooking.newStatus);

    try {
      setStatusLoading(true);
      setStatusError('');
      setStatusSuccess('');

      const bookingId = selectedBooking.booking_id || selectedBooking._id;
      const newStatus = selectedBooking.newStatus;

      if (!bookingId) {
        setStatusError('Booking ID is missing');
        return;
      }

      if (!newStatus) {
        setStatusError('New status is missing');
        return;
      }

      const result = await vendorAPI.changeBookingStatus(bookingId, newStatus);

      if (result.success) {
        setStatusSuccess(`Booking status changed to ${selectedBooking.newStatus} successfully!`);
        setShowStatusModal(false);
        fetchDashboardData(); // Refresh the data
      } else {
        setStatusError(result.message || 'Failed to change booking status');
      }
    } catch (err) {
      console.error('VendorDashboard: Error changing booking status:', err);
      setStatusError(err.response?.data?.message || 'Failed to change booking status');
    } finally {
      setStatusLoading(false);
    }
  };

  const getStatusActions = (status) => {
    switch (status) {
      case 'pending':
        return (
          <>
            <Button
              size="sm"
              variant="success"
              onClick={() => handleStatusChange(selectedBooking, 'confirmed')}
              className="me-2"
            >
              <i className="fas fa-check me-1"></i>
              Accept
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleStatusChange(selectedBooking, 'cancelled')}
            >
              <i className="fas fa-times me-1"></i>
              Reject
            </Button>
          </>
        );
      case 'confirmed':
        return (
          <Button
            size="sm"
            variant="info"
            onClick={() => handleStatusChange(selectedBooking, 'completed')}
          >
            <i className="fas fa-check-double me-1"></i>
            Mark Complete
          </Button>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <Container fluid className="h-100">
          <Row className="h-100 align-items-center justify-content-center">
            <Col xs={12} className="text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-3">Loading dashboard...</p>
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
              <h1 className="hero-title">Vendor Dashboard</h1>
              <p className="hero-subtitle">Manage your services and bookings</p>
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
                  {error.includes('verified') ? (
                    <>
                      1. Your vendor account needs admin verification
                      <br />
                      2. Contact an administrator to verify your account
                      <br />
                      3. You can still view your profile while waiting
                    </>
                  ) : (
                    <>
                      1. Make sure your backend server is running on http://localhost:5000
                      <br />
                      2. Check the browser console for more details
                      <br />
                      3. Try refreshing the page
                    </>
                  )}
                </p>
              </Alert>
            </Col>
          </Row>
        )}

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col xs={12} md={4} className="mb-3">
            <Card className="stats-card text-center">
              <Card.Body>
                <div className="stats-number">{bookingRequests.length}</div>
                <div className="stats-label">Pending Requests</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={4} className="mb-3">
            <Card className="stats-card text-center">
              <Card.Body>
                <div className="stats-number">{bookedServices.length}</div>
                <div className="stats-label">Active Bookings</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={4} className="mb-3">
            <Card className="stats-card text-center">
              <Card.Body>
                <div className="stats-number">
                  ₹{bookedServices.reduce((total, booking) => total + (booking.total_amount || 0), 0).toLocaleString()}
                </div>
                <div className="stats-label">Active Booking Value</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Booking Requests Section */}
        <Row className="mb-4">
          <Col xs={12}>
            <Card>
              <Card.Header>
                <h2 className="section-title mb-0">
                  <i className="fas fa-clock me-2"></i>
                  Booking Requests ({bookingRequests.length})
                </h2>
              </Card.Header>
              <Card.Body>
                {bookingRequests.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                    <h4 className="text-muted">No pending requests</h4>
                    <p className="text-muted">New booking requests will appear here</p>
                  </div>
                ) : (
                  <Row>
                    {bookingRequests.map((booking) => (
                      <Col xs={12} md={6} lg={4} key={booking.booking_id || booking._id} className="mb-3">
                        <Card className="booking-card h-100">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h5 className="booking-service">{booking.service?.title || 'Unknown Service'}</h5>
                              <Badge bg="warning">Pending</Badge>
                            </div>
                            <div className="booking-details">
                              <p className="booking-client">
                                <i className="fas fa-user me-2"></i>
                                <strong>Client:</strong> {booking.client?.full_name || 'Unknown Client'}
                              </p>
                              <p className="booking-date">
                                <i className="fas fa-calendar me-2"></i>
                                <strong>Date:</strong> {formatDate(booking.booking_date)}
                              </p>
                              <p className="booking-price">
                                <i className="fas fa-rupee-sign me-2"></i>
                                <strong>Amount:</strong> {formatPrice(booking.total_amount)}
                              </p>
                              <p className="booking-contact">
                                <i className="fas fa-phone me-2"></i>
                                <strong>Phone:</strong> {booking.client?.phone || 'N/A'}
                              </p>
                            </div>
                            <div className="d-flex justify-content-between mt-3">
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => handleStatusChange(booking, 'confirmed')}
                                className="me-2"
                              >
                                <i className="fas fa-check me-1"></i>
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleStatusChange(booking, 'cancelled')}
                              >
                                <i className="fas fa-times me-1"></i>
                                Reject
                              </Button>
                            </div>
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

        {/* Booked Services Section */}
        <Row>
          <Col xs={12}>
            <Card>
              <Card.Header>
                <h2 className="section-title mb-0">
                  <i className="fas fa-calendar-check me-2"></i>
                  Active Bookings ({bookedServices.length})
                </h2>
              </Card.Header>
              <Card.Body>
                {bookedServices.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                    <h4 className="text-muted">No active bookings</h4>
                    <p className="text-muted">Confirmed bookings will appear here</p>
                  </div>
                ) : (
                  <Row>
                    {bookedServices.map((booking) => (
                      <Col xs={12} md={6} lg={4} key={booking.booking_id || booking._id} className="mb-3">
                        <Card className="booking-card h-100">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h5 className="booking-service">{booking.service?.title || 'Unknown Service'}</h5>
                              <Badge bg={getStatusBadge(booking?.status).variant}>
                                {getStatusBadge(booking?.status).text}
                              </Badge>
                            </div>
                            <div className="booking-details">
                              <p className="booking-client">
                                <i className="fas fa-user me-2"></i>
                                <strong>Client:</strong> {booking.client?.full_name || 'Unknown Client'}
                              </p>
                              <p className="booking-date">
                                <i className="fas fa-calendar me-2"></i>
                                <strong>Date:</strong> {formatDate(booking.booking_date)}
                              </p>
                              <p className="booking-price">
                                <i className="fas fa-rupee-sign me-2"></i>
                                <strong>Amount:</strong> {formatPrice(booking.total_amount)}
                              </p>
                              <p className="booking-contact">
                                <i className="fas fa-phone me-2"></i>
                                <strong>Phone:</strong> {booking.client?.phone || 'N/A'}
                              </p>
                            </div>
                            {booking.status === 'confirmed' && (
                              <div className="mt-3">
                                <Button
                                  size="sm"
                                  variant="info"
                                  onClick={() => handleStatusChange(booking, 'completed')}
                                  className="w-100"
                                >
                                  <i className="fas fa-check-double me-1"></i>
                                  Mark Complete
                                </Button>
                              </div>
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

        {/* Status Change Modal */}
        <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Change Booking Status</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {statusError && (
              <Alert variant="danger" dismissible onClose={() => setStatusError('')}>
                {statusError}
              </Alert>
            )}
            
            {statusSuccess && (
              <Alert variant="success" dismissible onClose={() => setStatusSuccess('')}>
                {statusSuccess}
              </Alert>
            )}

            {selectedBooking && (
              <div>
                <h5>Confirm Status Change</h5>
                <p><strong>Service:</strong> {selectedBooking.service?.title || 'Unknown Service'}</p>
                <p><strong>Client:</strong> {selectedBooking.client?.full_name || 'Unknown Client'}</p>
                <p><strong>Current Status:</strong> 
                  <Badge bg={getStatusBadge(selectedBooking?.status).variant} className="ms-2">
                    {getStatusBadge(selectedBooking?.status).text}
                  </Badge>
                </p>
                <p><strong>New Status:</strong> 
                  <Badge bg={getStatusBadge(selectedBooking?.newStatus).variant} className="ms-2">
                    {getStatusBadge(selectedBooking?.newStatus).text}
                  </Badge>
                </p>
                
                <div className="d-grid gap-2 mt-3">
                  <Button 
                    variant="primary"
                    onClick={confirmStatusChange}
                    disabled={statusLoading}
                  >
                    {statusLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Updating...
                      </>
                    ) : (
                      'Confirm Change'
                    )}
                  </Button>
                  <Button 
                    variant="outline-secondary"
                    onClick={() => setShowStatusModal(false)}
                    disabled={statusLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
};

export default VendorDashboard;
