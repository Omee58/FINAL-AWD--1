import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge, Pagination } from 'react-bootstrap';
import { adminAPI, formatDate, formatPrice, getStatusBadge } from '../../services/api';

const AdminAllBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});

  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [analytics, setAnalytics] = useState({});

  useEffect(() => {
    console.log('AdminAllBookings: Component mounted, fetching bookings...');
    fetchBookings();
  }, [statusFilter, currentPage]);

  const fetchBookings = async () => {
    try {
      console.log('AdminAllBookings: Fetching bookings with filters...');
      setLoading(true);
      setError('');

      const filters = {
        page: currentPage,
        limit: 9
      };

      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      const response = await adminAPI.getAllBookings(filters);
      console.log('AdminAllBookings: Bookings response:', response);

      const bookingsData = Array.isArray(response.data) ? response.data : [];
      setBookings(bookingsData);
      setPagination(response.pagination || {});
      setAnalytics({ status_count: response.status_count, total_revenue: response.total_revenue })
    } catch (err) {
      console.error('AdminAllBookings: Error fetching bookings:', err);
      setError(err.response?.data?.message || 'Failed to fetch bookings. Please check if the backend server is running.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (value) => {
    setCurrentPage(1); // Reset to first page when filter changes
    setStatusFilter(value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // const getFilteredBookingsByStatus = () => {
  //   const pending = bookings.filter(booking => booking.status === 'pending');
  //   const confirmed = bookings.filter(booking => booking.status === 'confirmed');
  //   const completed = bookings.filter(booking => booking.status === 'completed');
  //   const cancelled = bookings.filter(booking => booking.status === 'cancelled');

  //   return { pending, confirmed, completed, cancelled };
  // };

  const renderBookingCard = (booking) => (
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
            <p className="booking-vendor">
              <i className="fas fa-store me-2"></i>
              <strong>Vendor:</strong> {booking.vendor?.full_name || 'Unknown Vendor'}
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
              <strong>Client Phone:</strong> {booking.client?.phone || 'N/A'}
            </p>
            <p className="booking-email">
              <i className="fas fa-envelope me-2"></i>
              <strong>Client Email:</strong> {booking.client?.email || 'N/A'}
            </p>
            <p className="booking-created">
              <i className="fas fa-clock me-2"></i>
              <strong>Created:</strong> {formatDate(booking.created_at)}
            </p>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );

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

  // const { pending, confirmed, completed, cancelled } = getFilteredBookingsByStatus();

  return (
    <div className="dashboard-page">
      <Container fluid className="h-100">
        {/* Hero Section */}
        <Row className="hero-section mb-5">
          <Col xs={12}>
            <div className="hero-content text-center">
              <h1 className="hero-title">All Bookings</h1>
              <p className="hero-subtitle">Monitor all system bookings</p>
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
        <Row className="mb-4 justify-content-center">
          <Col xs={12} md={2} className="mb-3">
            <Card className="stats-card text-center">
              <Card.Body>
                <div className="stats-number">{analytics.status_count.Total||0}</div>
                <div className="stats-label">Total Bookings</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={2} className="mb-3">
            <Card className="stats-card text-center">
              <Card.Body>
                <div className="stats-number">{analytics.status_count.Pending||0}</div>
                <div className="stats-label">Pending</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={2} className="mb-3">
            <Card className="stats-card text-center">
              <Card.Body>
                <div className="stats-number">{analytics.status_count.Confirmed||0}</div>
                <div className="stats-label">Confirmed</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={2} className="mb-3">
            <Card className="stats-card text-center">
              <Card.Body>
                <div className="stats-number">{analytics.status_count.Completed||0}</div>
                <div className="stats-label">Completed</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={2} className="mb-3">
            <Card className="stats-card text-center">
              <Card.Body>
                <div className="stats-number">{analytics.status_count.Cancelled || 0}</div>
                <div className="stats-label">Cancelled</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={2} className="mb-3">
            <Card className="stats-card text-center">
              <Card.Body>
                <div className="stats-number" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 700 }}>
                    ₹{analytics.total_revenue.toLocaleString('en-IN') || 0}
                  </span>
                </div>
                <div className="stats-label">Total Revenue</div>
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
                      onChange={(e) => handleFilterChange(e.target.value)}
                      style={{ width: 'auto' }}
                    >
                      <option value="all">All Bookings</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </Form.Select>
                  </div>

                  <div className="d-flex align-items-center">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => {
                        setStatusFilter('all');
                        setCurrentPage(1);
                      }}
                    >
                      Clear Filter
                    </Button>
                  </div>
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
                  Bookings ({bookings.length})
                </h2>
              </Card.Header>
              <Card.Body>
                {bookings.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                    <h4 className="text-muted">No bookings found</h4>
                    <p className="text-muted">
                      {statusFilter !== 'all'
                        ? 'Try adjusting your filters'
                        : 'No bookings have been made yet'
                      }
                    </p>
                  </div>
                ) : (
                  <>
                    <Row>
                      {bookings.map(renderBookingCard)}
                    </Row>

                    {/* Pagination */}
                    {pagination && pagination.total_pages > 1 && (
                      <Row className="mt-4">
                        <Col xs={12} className="d-flex justify-content-center">
                          <Pagination>
                            <Pagination.First
                              onClick={() => handlePageChange(1)}
                              disabled={currentPage === 1}
                            />
                            <Pagination.Prev
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                            />

                            {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map(page => (
                              <Pagination.Item
                                key={page}
                                active={page === currentPage}
                                onClick={() => handlePageChange(page)}
                              >
                                {page}
                              </Pagination.Item>
                            ))}

                            <Pagination.Next
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === pagination.total_pages}
                            />
                            <Pagination.Last
                              onClick={() => handlePageChange(pagination.total_pages)}
                              disabled={currentPage === pagination.total_pages}
                            />
                          </Pagination>
                        </Col>
                      </Row>
                    )}

                    {/* Pagination Info */}
                    {pagination && (
                      <Row className="mt-2">
                        <Col xs={12} className="text-center">
                          <small className="text-muted">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, pagination.total_bookings || bookings.length)} of {pagination.total_bookings || bookings.length} bookings
                          </small>
                        </Col>
                      </Row>
                    )}
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminAllBookings;
