import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner, Modal } from 'react-bootstrap';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';
import { vendorAPI, formatDate, formatPrice, getStatusBadge } from '../../services/api';

const VendorDashboard = () => {
  const [bookingRequests, setBookingRequests] = useState([]);
  const [bookedServices, setBookedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [requestsRes, bookedRes] = await Promise.all([
        vendorAPI.getBookingRequests(),
        vendorAPI.getBookedServices()
      ]);
      setBookingRequests(Array.isArray(requestsRes.data) ? requestsRes.data : []);
      setBookedServices((Array.isArray(bookedRes.data) ? bookedRes.data : []).filter(b => b.status !== 'pending'));
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Your vendor account needs to be verified by an admin before accessing the dashboard.');
      } else {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      }
      setBookingRequests([]);
      setBookedServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (booking, newStatus) => {
    setSelectedBooking({ ...booking, newStatus });
    setShowStatusModal(true);
  };

  const confirmStatusChange = async () => {
    if (!selectedBooking) return;
    const bookingId = selectedBooking.booking_id || selectedBooking._id;
    try {
      setStatusLoading(true);
      await vendorAPI.changeBookingStatus(bookingId, selectedBooking.newStatus);
      toast.success(`Booking marked as ${selectedBooking.newStatus}`);
      setShowStatusModal(false);
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  // Earnings chart — group confirmed/completed bookings by month
  const earningsData = (() => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const map = {};
    [...bookingRequests, ...bookedServices]
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .forEach(b => {
        const d = new Date(b.booking_date || b.created_at);
        const key = months[d.getMonth()];
        map[key] = (map[key] || 0) + (b.total_amount || 0);
      });
    return Object.entries(map).map(([month, earnings]) => ({ month, earnings }));
  })();

  const totalEarnings = bookedServices
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + (b.total_amount || 0), 0);

  const completedCount = bookedServices.filter(b => b.status === 'completed').length;

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner animation="border" variant="danger" />
    </div>
  );

  return (
    <div className="dashboard-page">
      <Container fluid>
        <Row className="hero-section mb-4">
          <Col xs={12}>
            <div className="hero-content text-center">
              <h1 className="hero-title">Vendor Dashboard</h1>
              <p className="hero-subtitle">Manage your bookings and track earnings</p>
            </div>
          </Col>
        </Row>

        {error && (
          <Row className="mb-4">
            <Col xs={12}>
              <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>
            </Col>
          </Row>
        )}

        {/* Stats */}
        <Row className="mb-4 g-3">
          {[
            { label: 'Pending Requests', value: bookingRequests.length, icon: '⏳' },
            { label: 'Active Bookings', value: bookedServices.filter(b => b.status === 'confirmed').length, icon: '📅' },
            { label: 'Completed', value: completedCount, icon: '✅' },
            { label: 'Total Earnings', value: formatPrice(totalEarnings), icon: '💰' },
          ].map(s => (
            <Col xs={6} md={3} key={s.label}>
              <Card className="stats-card text-center">
                <Card.Body>
                  <div style={{ fontSize: '1.8rem' }}>{s.icon}</div>
                  <div className="stats-number">{s.value}</div>
                  <div className="stats-label">{s.label}</div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Earnings Chart */}
        {earningsData.length > 0 && (
          <Row className="mb-4">
            <Col xs={12}>
              <Card>
                <Card.Header><strong>📈 Earnings Overview</strong></Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={earningsData}>
                      <defs>
                        <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#e91e8c" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#e91e8c" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                      <Tooltip formatter={v => formatPrice(v)} />
                      <Area type="monotone" dataKey="earnings" stroke="#e91e8c" strokeWidth={2} fill="url(#earningsGrad)" name="Earnings" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Booking Requests */}
        <Row className="mb-4">
          <Col xs={12}>
            <Card>
              <Card.Header>
                <strong>⏳ Booking Requests ({bookingRequests.length})</strong>
              </Card.Header>
              <Card.Body>
                {bookingRequests.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <div style={{ fontSize: '2.5rem' }}>📭</div>
                    <p>No pending booking requests</p>
                  </div>
                ) : (
                  <Row className="g-3">
                    {bookingRequests.map((booking) => (
                      <Col xs={12} md={6} lg={4} key={booking.booking_id || booking._id}>
                        <Card className="booking-card h-100">
                          <Card.Body>
                            <div className="d-flex justify-content-between mb-2">
                              <h6 className="mb-0">{booking.service?.title || 'Service'}</h6>
                              <Badge bg="warning" text="dark">Pending</Badge>
                            </div>
                            <p className="mb-1 text-muted" style={{ fontSize: '0.85rem' }}>👤 {booking.client?.full_name}</p>
                            <p className="mb-1 text-muted" style={{ fontSize: '0.85rem' }}>📅 {formatDate(booking.booking_date)}</p>
                            <p className="mb-3 text-muted" style={{ fontSize: '0.85rem' }}>💰 {formatPrice(booking.total_amount)}</p>
                            <div className="d-flex gap-2">
                              <Button size="sm" variant="success" className="flex-fill" onClick={() => handleStatusChange(booking, 'confirmed')}>✓ Accept</Button>
                              <Button size="sm" variant="outline-danger" className="flex-fill" onClick={() => handleStatusChange(booking, 'cancelled')}>✗ Decline</Button>
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

        {/* Active Bookings */}
        <Row>
          <Col xs={12}>
            <Card>
              <Card.Header><strong>📅 Active & Recent Bookings ({bookedServices.length})</strong></Card.Header>
              <Card.Body>
                {bookedServices.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <div style={{ fontSize: '2.5rem' }}>📆</div>
                    <p>No active bookings</p>
                  </div>
                ) : (
                  <Row className="g-3">
                    {bookedServices.map((booking) => (
                      <Col xs={12} md={6} lg={4} key={booking.booking_id || booking._id}>
                        <Card className="booking-card h-100">
                          <Card.Body>
                            <div className="d-flex justify-content-between mb-2">
                              <h6 className="mb-0">{booking.service?.title || 'Service'}</h6>
                              <Badge bg={getStatusBadge(booking.status).variant}>{getStatusBadge(booking.status).text}</Badge>
                            </div>
                            <p className="mb-1 text-muted" style={{ fontSize: '0.85rem' }}>👤 {booking.client?.full_name}</p>
                            <p className="mb-1 text-muted" style={{ fontSize: '0.85rem' }}>📅 {formatDate(booking.booking_date)}</p>
                            <p className="mb-3 text-muted" style={{ fontSize: '0.85rem' }}>💰 {formatPrice(booking.total_amount)}</p>
                            {booking.status === 'confirmed' && (
                              <Button size="sm" variant="info" className="w-100" onClick={() => handleStatusChange(booking, 'completed')}>
                                ✓✓ Mark Complete
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

        {/* Status Modal */}
        <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Status Change</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedBooking && (
              <>
                <p><strong>Service:</strong> {selectedBooking.service?.title}</p>
                <p><strong>Client:</strong> {selectedBooking.client?.full_name}</p>
                <p>Change status to: <Badge bg={getStatusBadge(selectedBooking.newStatus).variant}>{selectedBooking.newStatus}</Badge></p>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowStatusModal(false)} disabled={statusLoading}>Cancel</Button>
            <Button variant="primary" onClick={confirmStatusChange} disabled={statusLoading}>
              {statusLoading ? <Spinner size="sm" animation="border" /> : 'Confirm'}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default VendorDashboard;
