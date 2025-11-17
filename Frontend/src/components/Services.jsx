import { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, Modal, Alert, Spinner } from 'react-bootstrap';
import { clientAPI } from '../services/api';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  // Filter states
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    search: ''
  });

  // Track initial load
  const isFirstLoad = useRef(true);

  useEffect(() => {
    fetchServices();
    // After first fetch, set to false
    if (isFirstLoad.current) isFirstLoad.current = false;
    // eslint-disable-next-line
  }, [filters]);

  const fetchServices = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await clientAPI.getServices(filters);
      let servicesData = [];
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          servicesData = response.data;
        } else if (response.data.services && Array.isArray(response.data.services)) {
          servicesData = response.data.services;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          servicesData = response.data.data;
        } else {
          servicesData = [];
        }
      }
      setServices(servicesData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch services. Please check if the backend server is running.');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBookService = (service) => {
    setSelectedService(service);
    setShowBookingModal(true);
    setBookingError('');
    setBookingSuccess('');
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedService) return;

    // Get form data directly from the form elements
    const form = e.target;
    const bookingDateInput = form.querySelector('input[name="bookingDate"]');
    const additionalNotesInput = form.querySelector('textarea[name="additionalNotes"]');
    
    const bookingDate = bookingDateInput?.value;
    const additionalNotes = additionalNotesInput?.value;

    if (!bookingDate) {
      setBookingError('Please select a booking date');
      return;
    }

    if (!selectedService.vendor?._id && !selectedService.vendor?.vendor_id) {
      setBookingError('Vendor information not available for this service');
      return;
    }

    try {
      setBookingLoading(true);
      setBookingError('');
      setBookingSuccess('');
      
      // Prepare booking data according to backend API requirements
      const bookingData = {
        serviceId: selectedService._id || selectedService.service_id,
        vendorId: selectedService.vendor?._id || selectedService.vendor?.vendor_id,
        bookingDate: new Date(bookingDate).toISOString(),
        totalAmount: selectedService.price
      };

      console.log('Services: Sending booking data:', bookingData);
      console.log('Services: Data type:', typeof bookingData);
      console.log('Services: Data stringified:', JSON.stringify(bookingData));
      
      const result = await clientAPI.bookService(bookingData);
      
      if (result.success) {
        setBookingSuccess('Service booked successfully!');
        setShowBookingModal(false);
        fetchServices(); // Refresh the list
      } else {
        setBookingError(result.message || result.error);
      }
    } catch (err) {
      console.error('Services: Booking error:', err);
      setBookingError(err.response?.data?.message || 'Failed to book service');
    } finally {
      setBookingLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      location: '',
      minPrice: '',
      maxPrice: '',
      search: ''
    });
  };

  // Ensure services is always an array for mapping
  const servicesArray = Array.isArray(services) ? services : [];
  
  console.log('Services: Rendering with loading:', loading, 'error:', error, 'services:', servicesArray);

  // Only show full-page spinner on first load
  if (loading && isFirstLoad.current) {
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
              <h1 className="hero-title">Find Wedding Services</h1>
              <p className="hero-subtitle">Discover and book the perfect services for your special day</p>
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

        {/* Filters Section */}
        <Row className="mb-4">
          <Col xs={12}>
            <Card className="filters-card">
              <Card.Header>
                <h2 className="section-title mb-0">
                  <i className="fas fa-filter me-2"></i>
                  Search & Filters
                </h2>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col xs={12} md={6} lg={3} className="mb-3">
                    <Form.Group>
                      <Form.Label className="filter-label">Search</Form.Label>
                      <Form.Control
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        placeholder="Search services..."
                        className="filter-input"
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={6} lg={3} className="mb-3">
                    <Form.Group>
                      <Form.Label className="filter-label">Category</Form.Label>
                      <Form.Select
                        name="category"
                        value={filters.category}
                        onChange={handleFilterChange}
                        className="filter-input"
                      >
                        <option value="">All Categories</option>
                        <option value="photography">Photography</option>
                        <option value="catering">Catering</option>
                        <option value="decoration">Decoration</option>
                        <option value="music">Music</option>
                        <option value="transport">Transport</option>
                        <option value="makeup">Makeup</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={6} lg={3} className="mb-3">
                    <Form.Group>
                      <Form.Label className="filter-label">Location</Form.Label>
                      <Form.Control
                        type="text"
                        name="location"
                        value={filters.location}
                        onChange={handleFilterChange}
                        placeholder="Enter location..."
                        className="filter-input"
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={6} lg={3} className="mb-3">
                    <Form.Group>
                      <Form.Label className="filter-label">Price Range</Form.Label>
                      <Row>
                        <Col xs={6}>
                          <Form.Control
                            type="number"
                            name="minPrice"
                            value={filters.minPrice}
                            onChange={handleFilterChange}
                            placeholder="Min"
                            className="filter-input"
                          />
                        </Col>
                        <Col xs={6}>
                          <Form.Control
                            type="number"
                            name="maxPrice"
                            value={filters.maxPrice}
                            onChange={handleFilterChange}
                            placeholder="Max"
                            className="filter-input"
                          />
                        </Col>
                      </Row>
                    </Form.Group>
                  </Col>
                </Row>
                <div className="text-center">
                  <Button variant="outline-secondary" onClick={clearFilters} className="filter-button">
                    <i className="fas fa-times me-2"></i>
                    Clear Filters
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Services Section */}
        <Row>
          <Col xs={12}>
            <Card>
              <Card.Header>
                <h2 className="section-title mb-0">
                  <i className="fas fa-list me-2"></i>
                  Available Services ({servicesArray.length})
                  {/* Small spinner for filter changes */}
                  {loading && !isFirstLoad.current && (
                    <Spinner
                      animation="border"
                      size="sm"
                      className="ms-2"
                      style={{ verticalAlign: 'middle' }}
                    />
                  )}
                </h2>
              </Card.Header>
              <Card.Body>
                {servicesArray.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-search fa-3x text-muted mb-3"></i>
                    <h4 className="text-muted">No services found</h4>
                    <p className="text-muted">Try adjusting your filters or search terms</p>
                  </div>
                ) : (
                  <Row>
                    {servicesArray.map((service) => (
                      <Col xs={12} md={6} lg={4} key={service._id || service.service_id} className="mb-3">
                        <Card className="service-card h-100">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h5 className="service-title">{service.name || service.title || 'Unknown Service'}</h5>
                              <Badge bg="primary">{service.category || 'General'}</Badge>
                            </div>
                            <p className="service-description text-muted">
                              {service.description || 'No description available'}
                            </p>
                            <div className="service-details">
                              <p className="service-vendor">
                                <i className="fas fa-user-tie me-2"></i>
                                {service.vendor?.full_name || 'Unknown Vendor'}
                              </p>
                              <p className="service-location">
                                <i className="fas fa-map-marker-alt me-2"></i>
                                {service.location || 'Location not specified'}
                              </p>
                              <p className="service-price">
                                <i className="fas fa-rupee-sign me-2"></i>
                                {service.price || 'Price not available'}
                              </p>
                            </div>
                            <Button
                              variant="primary"
                              onClick={() => handleBookService(service)}
                              className="w-100 service-book-button"
                            >
                              <i className="fas fa-calendar-plus me-2"></i>
                              Book Service
                            </Button>
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

        {/* Booking Modal */}
        <Modal show={showBookingModal} onHide={() => setShowBookingModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Book Service</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {bookingError && (
              <Alert variant="danger" dismissible onClose={() => setBookingError('')}>
                {bookingError}
              </Alert>
            )}
            
            {bookingSuccess && (
              <Alert variant="success" dismissible onClose={() => setBookingSuccess('')}>
                {bookingSuccess}
              </Alert>
            )}

            {selectedService && (
              <div>
                <h5>{selectedService.name || selectedService.title}</h5>
                <p className="text-muted">{selectedService.description || 'No description available'}</p>
                <p><strong>Vendor:</strong> {selectedService.vendor?.full_name || 'Unknown Vendor'}</p>
                <p><strong>Price:</strong> ₹{selectedService.price || 'Price not available'}</p>
                <p><strong>Location:</strong> {selectedService.location || 'Location not specified'}</p>
                
                <Form onSubmit={handleBookingSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Booking Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="bookingDate"
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Additional Notes (Optional)</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="additionalNotes"
                      rows={3}
                      placeholder="Any special requirements or notes..."
                    />
                  </Form.Group>
                  
                  <div className="d-grid">
                    <Button 
                      type="submit" 
                      variant="primary"
                      disabled={bookingLoading}
                    >
                      {bookingLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Booking...
                        </>
                      ) : (
                        'Confirm Booking'
                      )}
                    </Button>
                  </div>
                </Form>
              </div>
            )}
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
};

export default Services;
