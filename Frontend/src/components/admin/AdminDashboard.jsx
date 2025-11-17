import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Modal } from 'react-bootstrap';
import { adminAPI, formatDate } from '../../services/api';

const AdminDashboard = () => {
  const [vendorRequests, setVendorRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [acceptError, setAcceptError] = useState('');
  const [acceptSuccess, setAcceptSuccess] = useState('');

  useEffect(() => {
    console.log('AdminDashboard: Component mounted, fetching vendor requests...');
    fetchVendorRequests();
  }, []);

  const fetchVendorRequests = async () => {
    try {
      console.log('AdminDashboard: Fetching vendor requests...');
      setLoading(true);
      setError('');

      const response = await adminAPI.getVendorRequests();
      console.log('AdminDashboard: Vendor requests response:', response);

      const requestsData = Array.isArray(response.data) ? response.data : [];
      setVendorRequests(requestsData);
    } catch (err) {
      console.error('AdminDashboard: Error fetching vendor requests:', err);
      setError(err.response?.data?.message || 'Failed to fetch vendor requests. Please check if the backend server is running.');
      setVendorRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptVendor = (vendor) => {
    setSelectedVendor(vendor);
    setShowAcceptModal(true);
    setAcceptError('');
    setAcceptSuccess('');
  };

  const confirmAcceptVendor = async () => {
    if (!selectedVendor) return;

    try {
      setAcceptLoading(true);
      setAcceptError('');
      setAcceptSuccess('');

      const vendorId = selectedVendor.vendor_id || selectedVendor._id;
      const result = await adminAPI.acceptVendorRequest(vendorId);

      if (result.success) {
        setAcceptSuccess(`Vendor ${selectedVendor.full_name} has been verified successfully!`);
        setShowAcceptModal(false);
        fetchVendorRequests(); // Refresh the data
      } else {
        setAcceptError(result.message || 'Failed to accept vendor request');
      }
    } catch (err) {
      console.error('AdminDashboard: Error accepting vendor request:', err);
      setAcceptError(err.response?.data?.message || 'Failed to accept vendor request');
    } finally {
      setAcceptLoading(false);
    }
  };

  const last7DaysCount = vendorRequests.filter(v => {
    if (!v.created_at) return false;
    const created = new Date(v.created_at);
    const now = new Date();
    const diff = (now - created) / (1000 * 60 * 60 * 24); // days
    return diff <= 7;
  }).length;


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
              <h1 className="hero-title">Admin Dashboard</h1>
              <p className="hero-subtitle">Manage vendor requests and system overview</p>
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

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col xs={12} md={4} className="mb-3">
            <Card className="stats-card text-center">
              <Card.Body>
                <div className="stats-number">{vendorRequests.length}</div>
                <div className="stats-label">Pending Vendor Requests</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={4} className="mb-3">
            <Card className="stats-card text-center">
              <Card.Body>
                <div className="stats-number">
                  {last7DaysCount || 0}
                </div>
                <div className="stats-label">New in Last 7 Days</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={4} className="mb-3">
            <Card className="stats-card text-center">
              <Card.Body>
                <div className="stats-number">
                  {vendorRequests.length > 0 ? 'Action Required' : 'All Clear'}
                </div>
                <div className="stats-label">Status</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Vendor Requests Section */}
        <Row>
          <Col xs={12}>
            <Card>
              <Card.Header>
                <h2 className="section-title mb-0">
                  <i className="fas fa-user-clock me-2"></i>
                  Vendor Access Requests ({vendorRequests.length})
                </h2>
              </Card.Header>
              <Card.Body>
                {vendorRequests.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-check-circle fa-3x text-success mb-3"></i>
                    <h4 className="text-success">No pending requests</h4>
                    <p className="text-muted">All vendor requests have been processed</p>
                  </div>
                ) : (
                  <Row>
                    {vendorRequests.map((vendor) => (
                      <Col xs={12} md={6} lg={4} key={vendor.vendor_id || vendor._id} className="mb-3">
                        <Card className="vendor-request-card h-100">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <h5 className="vendor-name">{vendor.full_name}</h5>
                              <span className="badge bg-warning">Pending Verification</span>
                            </div>
                            <div className="vendor-details">
                              <p className="vendor-email">
                                <i className="fas fa-envelope me-2"></i>
                                <strong>Email:</strong> {vendor.email}
                              </p>
                              <p className="vendor-phone">
                                <i className="fas fa-phone me-2"></i>
                                <strong>Phone:</strong> {vendor.phone}
                              </p>
                              <p className="vendor-role">
                                <i className="fas fa-user-tag me-2"></i>
                                <strong>Role:</strong> {vendor.role}
                              </p>
                              <p className="vendor-date">
                                <i className="fas fa-calendar me-2"></i>
                                <strong>Requested:</strong> {formatDate(vendor.created_at)}
                              </p>
                            </div>
                            <div className="mt-3">
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleAcceptVendor(vendor)}
                                className="w-100"
                              >
                                <i className="fas fa-check me-1"></i>
                                Accept & Verify
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

        {/* Accept Vendor Modal */}
        <Modal show={showAcceptModal} onHide={() => setShowAcceptModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Accept Vendor Request</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {acceptError && (
              <Alert variant="danger" dismissible onClose={() => setAcceptError('')}>
                {acceptError}
              </Alert>
            )}

            {acceptSuccess && (
              <Alert variant="success" dismissible onClose={() => setAcceptSuccess('')}>
                {acceptSuccess}
              </Alert>
            )}

            {selectedVendor && (
              <div>
                <h5>Confirm Vendor Verification</h5>
                <p><strong>Vendor Name:</strong> {selectedVendor.full_name}</p>
                <p><strong>Email:</strong> {selectedVendor.email}</p>
                <p><strong>Phone:</strong> {selectedVendor.phone}</p>
                <p><strong>Request Date:</strong> {formatDate(selectedVendor.created_at)}</p>

                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>Note:</strong> Once verified, this vendor will be able to:
                  <ul className="mb-0 mt-2">
                    <li>Create and manage services</li>
                    <li>Accept booking requests</li>
                    <li>Access all vendor functionality</li>
                  </ul>
                </div>

                <div className="d-grid gap-2 mt-3">
                  <Button
                    variant="success"
                    onClick={confirmAcceptVendor}
                    disabled={acceptLoading}
                  >
                    {acceptLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Verifying...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check me-1"></i>
                        Accept & Verify Vendor
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowAcceptModal(false)}
                    disabled={acceptLoading}
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

export default AdminDashboard;
