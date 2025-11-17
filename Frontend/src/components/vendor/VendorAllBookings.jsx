import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner, Modal, Form } from 'react-bootstrap';
import { vendorAPI, formatDate, formatPrice, getStatusBadge } from '../../services/api';

const VendorAllBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Status change modal states
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState('');
  const [statusSuccess, setStatusSuccess] = useState('');

  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    console.log('VendorAllBookings: Component mounted, fetching bookings...');
    fetchAllBookings();
  }, []);

  // Debug: Log when statusFilter changes
  useEffect(() => {
    console.log('VendorAllBookings: Status filter changed to:', statusFilter);
  }, [statusFilter]);

  const fetchAllBookings = async () => {
    try {
      console.log('VendorAllBookings: Fetching all bookings...');
      setLoading(true);
      setError('');

      // Since there's no specific "all bookings" endpoint, we'll combine booking requests and booked services
      const [requestsResponse, bookedResponse] = await Promise.all([
        vendorAPI.getBookingRequests(),
        vendorAPI.getBookedServices()
      ]);

      console.log('VendorAllBookings: Booking requests response:', requestsResponse);
      console.log('VendorAllBookings: Booked services response:', bookedResponse);

      // Combine and process all bookings
      const requestsData = Array.isArray(requestsResponse.data) ? requestsResponse.data : [];
      const bookedData = Array.isArray(bookedResponse.data) ? bookedResponse.data : [];

      // Add status to pending bookings if not present
      const processedRequests = requestsData.map(booking => ({
        ...booking,
        status: booking.status || 'pending'
      }));

      // Combine all bookings and remove duplicates by booking_id or _id
      const allBookingsMap = new Map();
      [...processedRequests, ...bookedData].forEach(booking => {
        const id = booking.booking_id || booking._id;
        allBookingsMap.set(id, booking);
      });
      const allBookings = Array.from(allBookingsMap.values());

      // Sort by creation date (newest first)
      allBookings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      // Debug: Log all booking statuses
      console.log('VendorAllBookings: All booking statuses:');
      allBookings.forEach((booking, index) => {
        console.log(`Booking ${index}:`, {
          id: booking.booking_id || booking._id,
          status: booking.status,
          service: booking.service?.title,
          client: booking.client?.full_name
        });
      });
      
      setBookings(allBookings);
    } catch (err) {
      console.error('VendorAllBookings: Error fetching bookings:', err);
      
      // Handle 403 Forbidden (unverified vendor)
      if (err.response?.status === 403) {
        setError('Your vendor account needs to be verified by an administrator before you can view bookings.');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch bookings. Please check if the backend server is running.');
      }
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (booking, status) => {
    setSelectedBooking(booking);
    setNewStatus(status);
    setShowStatusModal(true);
    setStatusError('');
    setStatusSuccess('');
  };

  const confirmStatusChange = async () => {
    if (!selectedBooking || !newStatus) return;

    try {
      setStatusLoading(true);
      setStatusError('');
      setStatusSuccess('');

      const result = await vendorAPI.changeBookingStatus(
        selectedBooking.booking_id || selectedBooking._id,
        newStatus
      );

      if (result.success) {
        setStatusSuccess(`Booking status changed to ${newStatus} successfully!`);
        setShowStatusModal(false);
        fetchAllBookings(); // Refresh the data
      } else {
        setStatusError(result.message || 'Failed to change booking status');
      }
    } catch (err) {
      console.error('VendorAllBookings: Error changing booking status:', err);
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

  // Helper function to normalize status values
  const normalizeStatus = (status) => {
    if (!status || typeof status !== 'string') return '';
    return status.toLowerCase().trim();
  };

  const getFilteredBookings = () => {
    console.log('VendorAllBookings: Filtering bookings with statusFilter:', statusFilter);
    console.log('VendorAllBookings: All bookings:', bookings);
    
    if (statusFilter === 'all') {
      console.log('VendorAllBookings: Returning all bookings:', bookings.length);
      return bookings;
    }
    
    const filtered = bookings.filter(booking => {
      const bookingStatus = normalizeStatus(booking?.status);
      const filterStatus = normalizeStatus(statusFilter);
      const matches = bookingStatus === filterStatus;
      
      console.log(`VendorAllBookings: Booking ${booking.booking_id || booking._id}:`, {
        bookingStatus,
        filterStatus,
        matches,
        originalStatus: booking?.status
      });
      
      return matches;
    });
    
    console.log('VendorAllBookings: Filtered bookings:', filtered.length);
    return filtered;
  };

  const filteredBookings = getFilteredBookings();

  if (loading) {
    return (
      <div className="dashboard-page">
        <Container fluid className="h-100">
          <Row className="h-100 align-items-center justify-content-center">
            <Col xs={12} className="text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-3">Loading bookings...</p>
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
              <h1 className="hero-title">All Bookings</h1>
              <p className="hero-subtitle">Manage all your service bookings</p>
            </div>
          </Col>
        </Row>

        {/* Error Alert */}
        {error && (
          <Row className="mb-4">
            <Col xs={12}>
              <Alert variant="danger" dismissible onClose={() => setError('')}>
                <h5>Error Loading Bookings</h5>
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

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col xs={12} md={2} className="mb-3">
            <Card className="stats-card text-center">
              <Card.Body>
                <div className="stats-number">{bookings.length}</div>
                <div className="stats-label">Total Bookings</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={2} className="mb-3">
            <Card className="stats-card text-center">
              <Card.Body>
                <div className="stats-number">
                  {bookings.filter(b => normalizeStatus(b?.status) === 'pending').length}
                </div>
                <div className="stats-label">Pending</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={2} className="mb-3">
            <Card className="stats-card text-center">
              <Card.Body>
                <div className="stats-number">
                  {bookings.filter(b => normalizeStatus(b?.status) === 'confirmed').length}
                </div>
                <div className="stats-label">Confirmed</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={2} className="mb-3">
            <Card className="stats-card text-center">
              <Card.Body>
                <div className="stats-number">
                  {bookings.filter(b => normalizeStatus(b?.status) === 'completed').length}
                </div>
                <div className="stats-label">Completed</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={2} className="mb-3">
            <Card className="stats-card text-center">
              <Card.Body>
                <div className="stats-number">
                  {bookings.filter(b => normalizeStatus(b?.status) === 'cancelled').length}
                </div>
                <div className="stats-label">Cancelled</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filter Section */}
        <Row className="mb-4">
          <Col xs={12}>
            <Card>
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <Form.Label className="me-3 mb-0">Filter by Status:</Form.Label>
                    <Form.Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      style={{ width: 'auto' }}
                    >
                      <option value="all">All Bookings</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </Form.Select>
                  </div>
                  {statusFilter !== 'all' && (
                    <div className="d-flex align-items-center">
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => setStatusFilter('all')}
                      >
                        Clear Filter
                      </Button>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Bookings List */}
        <Row>
          <Col xs={12}>
            <Card>
              <Card.Header>
                <h2 className="section-title mb-0">
                  <i className="fas fa-calendar-alt me-2"></i>
                  Bookings ({filteredBookings.length})
                </h2>
              </Card.Header>
              <Card.Body>
                {filteredBookings.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                    <h4 className="text-muted">No bookings found</h4>
                    <p className="text-muted">
                      {statusFilter === 'all' 
                        ? 'You don\'t have any bookings yet' 
                        : `No ${statusFilter} bookings found`
                      }
                    </p>
                  </div>
                ) : (
                  <Row>
                    {filteredBookings.map((booking) => (
                      <Col xs={12} md={6} lg={4} key={booking.booking_id || booking._id} className="mb-3">
                        <Card className="booking-card h-100">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h5 className="booking-service">{booking.service?.title || 'Unknown Service'}</h5>
                              <Badge bg={getStatusBadge(booking.status).variant}>
                                {getStatusBadge(booking.status).text}
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
                              <i class="fa-solid fa-indian-rupee-sign me-2"></i>
                                <strong>Amount:</strong> {formatPrice(booking.total_amount)}
                              </p>
                              <p className="booking-contact">
                                <i className="fas fa-phone me-2"></i>
                                <strong>Phone:</strong> {booking.client?.phone || 'N/A'}
                              </p>
                              <p className="booking-email">
                                <i className="fas fa-envelope me-2"></i>
                                <strong>Email:</strong> {booking.client?.email || 'N/A'}
                              </p>
                            </div>
                            {(booking.status === 'pending' || booking.status === 'confirmed') && (
                              <div className="mt-3">
                                {booking.status === 'pending' && (
                                  <div className="d-flex justify-content-between">
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
                                )}
                                {booking.status === 'confirmed' && (
                                  <Button
                                    size="sm"
                                    variant="info"
                                    onClick={() => handleStatusChange(booking, 'completed')}
                                    className="w-100"
                                  >
                                    <i className="fas fa-check-double me-1"></i>
                                    Mark Complete
                                  </Button>
                                )}
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
                  <Badge bg={getStatusBadge(selectedBooking.status).variant} className="ms-2">
                    {getStatusBadge(selectedBooking.status).text}
                  </Badge>
                </p>
                <p><strong>New Status:</strong> 
                  <Badge bg={getStatusBadge(newStatus).variant} className="ms-2">
                    {getStatusBadge(newStatus).text}
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

export default VendorAllBookings;
