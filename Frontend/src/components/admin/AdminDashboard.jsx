import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Modal, Form } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { toast } from 'react-toastify';
import { adminAPI, formatDate, formatPrice } from '../../services/api';

const PIE_COLORS = { pending: '#ffc107', confirmed: '#28a745', cancelled: '#dc3545', completed: '#17a2b8' };

const AdminDashboard = () => {
  const [vendorRequests, setVendorRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [actionType, setActionType] = useState(''); // 'accept' | 'reject'
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [reqRes, statsRes] = await Promise.all([
        adminAPI.getVendorRequests(),
        adminAPI.getStats(),
      ]);
      setVendorRequests(Array.isArray(reqRes.data) ? reqRes.data : []);
      if (statsRes.success) setStats(statsRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const openAction = (vendor, type) => {
    setSelectedVendor(vendor);
    setActionType(type);
    setRejectReason('');
  };

  const confirmAction = async () => {
    if (!selectedVendor) return;
    const id = selectedVendor.vendor_id || selectedVendor._id;
    try {
      setActionLoading(true);
      if (actionType === 'accept') {
        await adminAPI.acceptVendorRequest(id);
        toast.success(`${selectedVendor.full_name} has been approved!`);
      } else {
        await adminAPI.rejectVendorRequest(id, rejectReason);
        toast.success(`${selectedVendor.full_name}'s request has been rejected.`);
      }
      setSelectedVendor(null);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const pieData = stats?.statusCounts
    ? Object.entries(stats.statusCounts).map(([name, value]) => ({ name, value }))
    : [];

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
              <h1 className="hero-title">Admin Dashboard</h1>
              <p className="hero-subtitle">Platform overview and vendor management</p>
            </div>
          </Col>
        </Row>

        {/* Overview Stats */}
        {stats && (
          <Row className="mb-4 g-3">
            {[
              { label: 'Total Users', value: stats.overview.totalUsers, icon: '👥' },
              { label: 'Active Vendors', value: stats.overview.totalVendors, icon: '🏪' },
              { label: 'Total Clients', value: stats.overview.totalClients, icon: '👤' },
              { label: 'Total Bookings', value: stats.overview.totalBookings, icon: '📅' },
              { label: 'Active Services', value: stats.overview.totalServices, icon: '💼' },
              { label: 'Total Revenue', value: formatPrice(stats.overview.totalRevenue), icon: '💰' },
            ].map(s => (
              <Col xs={6} md={4} lg={2} key={s.label}>
                <Card className="stats-card text-center h-100">
                  <Card.Body className="py-3">
                    <div style={{ fontSize: '1.8rem' }}>{s.icon}</div>
                    <div className="stats-number" style={{ fontSize: '1.3rem' }}>{s.value}</div>
                    <div className="stats-label" style={{ fontSize: '0.78rem' }}>{s.label}</div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Charts */}
        {stats && stats.chartData?.length > 0 && (
          <Row className="mb-4 g-3">
            <Col xs={12} lg={8}>
              <Card>
                <Card.Header><strong>Monthly Bookings & Revenue (Last 6 Months)</strong></Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={stats.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip formatter={(v, n) => n === 'revenue' ? formatPrice(v) : v} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="bookings" fill="#e91e8c" name="Bookings" radius={[4,4,0,0]} />
                      <Bar yAxisId="right" dataKey="revenue" fill="#9c27b0" name="Revenue (₹)" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} lg={4}>
              <Card className="h-100">
                <Card.Header><strong>Booking Status Distribution</strong></Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {pieData.map(entry => (
                          <Cell key={entry.name} fill={PIE_COLORS[entry.name] || '#888'} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Vendor Requests */}
        <Row>
          <Col xs={12}>
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <strong>Pending Vendor Requests ({vendorRequests.length})</strong>
                {vendorRequests.length > 0 && <span className="badge bg-warning text-dark">Action Required</span>}
              </Card.Header>
              <Card.Body>
                {vendorRequests.length === 0 ? (
                  <div className="text-center py-5">
                    <div style={{ fontSize: '3rem' }}>✅</div>
                    <h4 className="text-success mt-2">All Clear</h4>
                    <p className="text-muted">No pending vendor requests</p>
                  </div>
                ) : (
                  <Row className="g-3">
                    {vendorRequests.map((vendor) => (
                      <Col xs={12} md={6} lg={4} key={vendor.vendor_id || vendor._id}>
                        <Card className="vendor-request-card h-100">
                          <Card.Body>
                            <div className="d-flex justify-content-between mb-2">
                              <h5 className="mb-0">{vendor.full_name}</h5>
                              <span className="badge bg-warning text-dark">Pending</span>
                            </div>
                            <p className="mb-1 text-muted" style={{ fontSize: '0.85rem' }}>📧 {vendor.email}</p>
                            <p className="mb-1 text-muted" style={{ fontSize: '0.85rem' }}>📞 {vendor.phone}</p>
                            <p className="mb-3 text-muted" style={{ fontSize: '0.85rem' }}>📅 {formatDate(vendor.created_at)}</p>
                            <div className="d-flex gap-2">
                              <Button variant="success" size="sm" className="flex-fill" onClick={() => openAction(vendor, 'accept')}>
                                ✓ Approve
                              </Button>
                              <Button variant="outline-danger" size="sm" className="flex-fill" onClick={() => openAction(vendor, 'reject')}>
                                ✗ Reject
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
      </Container>

      {/* Action Modal */}
      <Modal show={!!selectedVendor} onHide={() => setSelectedVendor(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{actionType === 'accept' ? '✓ Approve Vendor' : '✗ Reject Vendor'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedVendor && (
            <>
              <p><strong>{selectedVendor.full_name}</strong> — {selectedVendor.email}</p>
              {actionType === 'reject' && (
                <Form.Group>
                  <Form.Label>Reason for rejection (optional)</Form.Label>
                  <Form.Control
                    as="textarea" rows={3} value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="Provide a reason..."
                  />
                </Form.Group>
              )}
              {actionType === 'accept' && (
                <div className="alert alert-info mt-2">
                  This vendor will gain full access to create services and manage bookings.
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelectedVendor(null)} disabled={actionLoading}>Cancel</Button>
          <Button
            variant={actionType === 'accept' ? 'success' : 'danger'}
            onClick={confirmAction} disabled={actionLoading}
          >
            {actionLoading ? <Spinner size="sm" animation="border" /> : actionType === 'accept' ? 'Approve' : 'Reject'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
