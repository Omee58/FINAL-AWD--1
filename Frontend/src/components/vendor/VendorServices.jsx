import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner, Modal, Form } from 'react-bootstrap';
import { vendorAPI, formatPrice } from '../../services/api';

const VendorServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Add/Edit Service Modal States
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    location: '',
    images: []
  });
  const [serviceLoading, setServiceLoading] = useState(false);
  const [serviceError, setServiceError] = useState('');
  const [serviceSuccess, setServiceSuccess] = useState('');

  // Delete Confirmation Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingService, setDeletingService] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    console.log('VendorServices: Component mounted, fetching services...');
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      console.log('VendorServices: Fetching vendor services...');
      setLoading(true);
      setError('');

      const response = await vendorAPI.getMyServices();
      console.log('VendorServices: Services response:', response);

      // Ensure services is always an array
      const servicesData = Array.isArray(response.data) ? response.data : [];
      setServices(servicesData);
    } catch (err) {
      console.error('VendorServices: Error fetching services:', err);
      
      // Handle 403 Forbidden (unverified vendor)
      if (err.response?.status === 403) {
        setError('Your vendor account needs to be verified by an administrator before you can manage services.');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch services. Please check if the backend server is running.');
      }
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = () => {
    setEditingService(null);
    setServiceForm({
      title: '',
      description: '',
      price: '',
      category: '',
      location: '',
      images: []
    });
    setShowServiceModal(true);
    setServiceError('');
    setServiceSuccess('');
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setServiceForm({
      title: service.title || '',
      description: service.description || '',
      price: service.price || '',
      category: service.category || '',
      location: service.location || '',
      images: service.images || []
    });
    setShowServiceModal(true);
    setServiceError('');
    setServiceSuccess('');
  };

  const handleDeleteService = (service) => {
    setDeletingService(service);
    setShowDeleteModal(true);
    setDeleteError('');
  };

  const handleServiceFormChange = (e) => {
    const { name, value } = e.target;
    setServiceForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!serviceForm.title || !serviceForm.description || !serviceForm.price || !serviceForm.category || !serviceForm.location) {
      setServiceError('All fields are required');
      return;
    }

    // Validate price
    if (isNaN(serviceForm.price) || parseFloat(serviceForm.price) <= 0) {
      setServiceError('Price must be a positive number');
      return;
    }

    try {
      setServiceLoading(true);
      setServiceError('');
      setServiceSuccess('');

      const serviceData = {
        ...serviceForm,
        price: parseFloat(serviceForm.price)
      };

      let result;
      if (editingService) {
        // Update existing service
        result = await vendorAPI.updateService(editingService.service_id || editingService._id, serviceData);
      } else {
        // Add new service
        result = await vendorAPI.addService(serviceData);
      }

      if (result.success) {
        setServiceSuccess(editingService ? 'Service updated successfully!' : 'Service added successfully!');
        setShowServiceModal(false);
        fetchServices(); // Refresh the list
      } else {
        setServiceError(result.message || 'Failed to save service');
      }
    } catch (err) {
      console.error('VendorServices: Error saving service:', err);
      setServiceError(err.response?.data?.message || 'Failed to save service');
    } finally {
      setServiceLoading(false);
    }
  };

  const confirmDeleteService = async () => {
    if (!deletingService) return;

    try {
      setDeleteLoading(true);
      setDeleteError('');

      const result = await vendorAPI.deleteService(deletingService.service_id || deletingService._id);

      if (result.success) {
        setShowDeleteModal(false);
        fetchServices(); // Refresh the list
      } else {
        setDeleteError(result.message || 'Failed to delete service');
      }
    } catch (err) {
      console.error('VendorServices: Error deleting service:', err);
      setDeleteError(err.response?.data?.message || 'Failed to delete service');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'active': 'success',
      'inactive': 'secondary'
    };
    
    return {
      variant: statusClasses[status] || 'secondary',
      text: status.charAt(0).toUpperCase() + status.slice(1)
    };
  };

  if (loading) {
    return (
      <div className="services-page">
        <Container fluid className="h-100">
          <Row className="h-100 align-items-center justify-content-center">
            <Col xs={12} className="text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-3">Loading services...</p>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <div className="services-page">
      <Container fluid className="h-100">
        {/* Hero Section */}
        <Row className="hero-section mb-5">
          <Col xs={12}>
            <div className="hero-content text-center">
              <h1 className="hero-title">My Services</h1>
              <p className="hero-subtitle">Manage your service offerings</p>
            </div>
          </Col>
        </Row>

        {/* Error Alert */}
        {error && (
          <Row className="mb-4">
            <Col xs={12}>
              <Alert variant="danger" dismissible onClose={() => setError('')}>
                <h5>Error Loading Services</h5>
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

        {/* Add Service Button */}
        <Row className="mb-4">
          <Col xs={12}>
            <div className="d-flex justify-content-between align-items-center">
              <h2 className="section-title mb-0">
                <i className="fas fa-list me-2"></i>
                My Services ({services.length})
              </h2>
              <Button variant="primary" onClick={handleAddService}>
                <i className="fas fa-plus me-2"></i>
                Add New Service
              </Button>
            </div>
          </Col>
        </Row>

        {/* Services List */}
        <Row>
          <Col xs={12}>
            {services.length === 0 ? (
              <Card>
                <Card.Body className="text-center py-5">
                  <i className="fas fa-box-open fa-3x text-muted mb-3"></i>
                  <h4 className="text-muted">No services found</h4>
                  <p className="text-muted">Start by adding your first service</p>
                  <Button variant="primary" onClick={handleAddService}>
                    <i className="fas fa-plus me-2"></i>
                    Add Your First Service
                  </Button>
                </Card.Body>
              </Card>
            ) : (
              <Row>
                {services.map((service) => (
                  <Col xs={12} md={6} lg={4} key={service.service_id || service._id} className="mb-3">
                    <Card className="service-card h-100">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h5 className="service-title">{service.title || 'Unknown Service'}</h5>
                          <Badge bg={getStatusBadge(service.status).variant}>
                            {getStatusBadge(service.status).text}
                          </Badge>
                        </div>
                        <p className="service-description text-muted">
                          {service.description || 'No description available'}
                        </p>
                        <div className="service-details">
                          <p className="service-category">
                            <i className="fas fa-tag me-2"></i>
                            <strong>Category:</strong> {service.category || 'General'}
                          </p>
                          <p className="service-location">
                            <i className="fas fa-map-marker-alt me-2"></i>
                            <strong>Location:</strong> {service.location || 'Location not specified'}
                          </p>
                          <p className="service-price">
                            <i className="fas fa-rupee-sign me-2"></i>
                            <strong>Price:</strong> {formatPrice(service.price)}
                          </p>
                        </div>
                        <div className="d-flex justify-content-between mt-3">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => handleEditService(service)}
                          >
                            <i className="fas fa-edit me-1"></i>
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDeleteService(service)}
                          >
                            <i className="fas fa-trash me-1"></i>
                            Delete
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Col>
        </Row>

        {/* Add/Edit Service Modal */}
        <Modal show={showServiceModal} onHide={() => setShowServiceModal(false)} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingService ? 'Edit Service' : 'Add New Service'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {serviceError && (
              <Alert variant="danger" dismissible onClose={() => setServiceError('')}>
                {serviceError}
              </Alert>
            )}
            
            {serviceSuccess && (
              <Alert variant="success" dismissible onClose={() => setServiceSuccess('')}>
                {serviceSuccess}
              </Alert>
            )}

            <Form onSubmit={handleServiceSubmit}>
              <Row>
                <Col xs={12} md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Service Title *</Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={serviceForm.title}
                      onChange={handleServiceFormChange}
                      placeholder="Enter service title"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Category *</Form.Label>
                    <Form.Select
                      name="category"
                      value={serviceForm.category}
                      onChange={handleServiceFormChange}
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="photography">Photography</option>
                      <option value="catering">Catering</option>
                      <option value="decoration">Decoration</option>
                      <option value="music">Music</option>
                      <option value="transport">Transport</option>
                      <option value="makeup">Makeup</option>
                      <option value="venue">Venue</option>
                      <option value="other">Other</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Description *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={serviceForm.description}
                  onChange={handleServiceFormChange}
                  placeholder="Describe your service in detail"
                  required
                />
              </Form.Group>

              <Row>
                <Col xs={12} md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Price (₹) *</Form.Label>
                    <Form.Control
                      type="number"
                      name="price"
                      value={serviceForm.price}
                      onChange={handleServiceFormChange}
                      placeholder="Enter price"
                      min="0"
                      step="0.01"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Location *</Form.Label>
                    <Form.Control
                      type="text"
                      name="location"
                      value={serviceForm.location}
                      onChange={handleServiceFormChange}
                      placeholder="Enter service location"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-grid gap-2">
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={serviceLoading}
                >
                  {serviceLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saving...
                    </>
                  ) : (
                    editingService ? 'Update Service' : 'Add Service'
                  )}
                </Button>
                <Button 
                  variant="outline-secondary"
                  onClick={() => setShowServiceModal(false)}
                  disabled={serviceLoading}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {deleteError && (
              <Alert variant="danger" dismissible onClose={() => setDeleteError('')}>
                {deleteError}
              </Alert>
            )}

            {deletingService && (
              <div>
                <p>Are you sure you want to delete this service?</p>
                <p><strong>Service:</strong> {deletingService.title}</p>
                <p><strong>Category:</strong> {deletingService.category}</p>
                <p><strong>Price:</strong> {formatPrice(deletingService.price)}</p>
                
                <div className="alert alert-warning">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <strong>Warning:</strong> This action cannot be undone. If this service has active bookings, it cannot be deleted.
                </div>
                
                <div className="d-grid gap-2">
                  <Button 
                    variant="danger"
                    onClick={confirmDeleteService}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Deleting...
                      </>
                    ) : (
                      'Delete Service'
                    )}
                  </Button>
                  <Button 
                    variant="outline-secondary"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={deleteLoading}
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

export default VendorServices;
