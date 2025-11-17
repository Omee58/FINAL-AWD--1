import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge, Pagination } from 'react-bootstrap';
import { adminAPI, formatDate } from '../../services/api';

const AdminAllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});

  // Filter states
  const [roleFilter, setRoleFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    console.log('AdminAllUsers: Component mounted, fetching users...');
    fetchUsers();
  }, [roleFilter, verifiedFilter, currentPage]);

  const fetchUsers = async () => {
    try {
      console.log('AdminAllUsers: Fetching users with filters...');
      setLoading(true);
      setError('');

      const filters = {
        page: currentPage,
        limit: itemsPerPage
      };

      if (roleFilter !== 'all') {
        filters.role = roleFilter;
      }

      if (verifiedFilter !== 'all') {
        filters.verified = verifiedFilter;
      }

      const response = await adminAPI.getAllUsers(filters);
      console.log('AdminAllUsers: Users response:', response);

      const usersData = Array.isArray(response.data) ? response.data : [];
      setUsers(usersData);
      setPagination(response.pagination || {});
    } catch (err) {
      console.error('AdminAllUsers: Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to fetch users. Please check if the backend server is running.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setCurrentPage(1); // Reset to first page when filter changes
    
    if (filterType === 'role') {
      setRoleFilter(value);
    } else if (filterType === 'verified') {
      setVerifiedFilter(value);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getRoleBadge = (role) => {
    const variants = {
      'admin': 'danger',
      'vendor': 'warning',
      'client': 'primary'
    };
    return <Badge bg={variants[role] || 'secondary'}>{role}</Badge>;
  };

  const getVerifiedBadge = (verified) => {
    return verified ? 
      <Badge bg="success mt-2">Verified</Badge> : 
      <Badge bg="secondary mt-2">Unverified</Badge>;
  };

  const getFilteredUsersByRole = () => {
    const clients = users.filter(user => user.role === 'client');
    const vendors = users.filter(user => user.role === 'vendor');
    const admins = users.filter(user => user.role === 'admin');
    
    return { clients, vendors, admins };
  };

  const renderUserCard = (user) => (
    <Col xs={12} md={6} lg={4} key={user.user_id || user._id} className="mb-3">
      <Card className="user-card h-100">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h5 className="user-name">{user.full_name}</h5>
            <div className="d-flex flex-column align-items-end ">
              {getRoleBadge(user.role)}
              {user.role === 'vendor' && getVerifiedBadge(user.verified)}
            </div>
          </div>
          <div className="user-details">
            <p className="user-email">
              <i className="fas fa-envelope me-2"></i>
              <strong>Email:</strong> {user.email}
            </p>
            <p className="user-phone">
              <i className="fas fa-phone me-2"></i>
              <strong>Phone:</strong> {user.phone || 'Not set'}
            </p>
            <p className="user-date">
              <i className="fas fa-calendar me-2"></i>
              {console.log("User is : ", user)}
              <strong>Joined:</strong> {formatDate(user.created_at)}
            </p>
            {user.role === 'vendor' && (
              <p className="user-status">
                <i className="fas fa-info-circle me-2"></i>
                <strong>Status:</strong> {user.verified ? 'Active' : 'Pending Verification'}
              </p>
            )}
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
              <p className="mt-3">Loading users...</p>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  const { clients, vendors, admins } = getFilteredUsersByRole();

  return (
    <div className="dashboard-page">
      <Container fluid className="h-100">
        {/* Hero Section */}
        <Row className="hero-section mb-5">
          <Col xs={12}>
            <div className="hero-content text-center">
              <h1 className="hero-title">All Users</h1>
              <p className="hero-subtitle">Manage and view all system users</p>
            </div>
          </Col>
        </Row>

        {/* Error Alert */}
        {error && (
          <Row className="mb-4">
            <Col xs={12}>
              <Alert variant="danger" dismissible onClose={() => setError('')}>
                <h5>Error Loading Users</h5>
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
          <Col xs={12} md={3} className="mb-3">
            <Card className="stats-card text-center">
              <Card.Body>
                <div className="stats-number">{users.length}</div>
                <div className="stats-label">Total Users</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={3} className="mb-3">
            <Card className="stats-card text-center">
              <Card.Body>
                <div className="stats-number">{clients.length}</div>
                <div className="stats-label">Clients</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={3} className="mb-3">
            <Card className="stats-card text-center">
              <Card.Body>
                <div className="stats-number">{vendors.length}</div>
                <div className="stats-label">Vendors</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={3} className="mb-3">
            <Card className="stats-card text-center">
              <Card.Body>
                <div className="stats-number">{admins.length}</div>
                <div className="stats-label">Admins</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filter Section */}
        <Row className="mb-4">
          <Col xs={12}>
            <Card>
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                  <div className="d-flex align-items-center flex-wrap">
                    <Form.Label className="me-3 mb-0">Filter by Role:</Form.Label>
                    <Form.Select
                      value={roleFilter}
                      onChange={(e) => handleFilterChange('role', e.target.value)}
                      style={{ width: 'auto' }}
                      className="me-3"
                    >
                      <option value="all">All Roles</option>
                      <option value="client">Clients</option>
                      <option value="vendor">Vendors</option>
                      <option value="admin">Admins</option>
                    </Form.Select>

                    <Form.Label className="me-3 mb-0">Verification:</Form.Label>
                    <Form.Select
                      value={verifiedFilter}
                      onChange={(e) => handleFilterChange('verified', e.target.value)}
                      style={{ width: 'auto' }}
                    >
                      <option value="all">All Status</option>
                      <option value="true">Verified</option>
                      <option value="false">Unverified</option>
                    </Form.Select>
                  </div>

                  <div className="d-flex align-items-center mt-2 mt-md-0">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => {
                        setRoleFilter('all');
                        setVerifiedFilter('all');
                        setCurrentPage(1);
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Users List */}
        <Row>
          <Col xs={12}>
            <Card>
              <Card.Header>
                <h2 className="section-title mb-0">
                  <i className="fas fa-users me-2"></i>
                  Users ({users.length})
                </h2>
              </Card.Header>
              <Card.Body>
                {users.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-user-slash fa-3x text-muted mb-3"></i>
                    <h4 className="text-muted">No users found</h4>
                    <p className="text-muted">
                      {roleFilter !== 'all' || verifiedFilter !== 'all' 
                        ? 'Try adjusting your filters' 
                        : 'No users registered yet'
                      }
                    </p>
                  </div>
                ) : (
                  <>
                    <Row>
                      {users.map(renderUserCard)}
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
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, pagination.total_users || users.length)} of {pagination.total_users || users.length} users
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

export default AdminAllUsers;
