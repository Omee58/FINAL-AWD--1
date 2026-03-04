import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Badge, Modal, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { clientAPI, formatPrice, UPLOAD_URL } from '../services/api';
import StarRating from './StarRating';

const CATEGORY_ICONS = { photography: '📸', catering: '🍽️', decoration: '🌸', music: '🎵', transport: '🚗', makeup: '💄', venue: '🏛️' };

const Services = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [filters, setFilters] = useState({ category: '', location: '', minPrice: '', maxPrice: '', search: '' });
  const isFirstLoad = useRef(true);

  useEffect(() => {
    fetchServices();
    if (isFirstLoad.current) isFirstLoad.current = false;
  }, [filters]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await clientAPI.getServices(filters);
      setServices(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch services');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingDate) { toast.error('Please select a booking date'); return; }
    if (!selectedService.vendor?._id && !selectedService.vendor?.vendor_id) {
      toast.error('Vendor information unavailable for this service');
      return;
    }
    try {
      setBookingLoading(true);
      const result = await clientAPI.bookService({
        serviceId: selectedService._id || selectedService.service_id,
        vendorId: selectedService.vendor?._id || selectedService.vendor?.vendor_id,
        bookingDate: new Date(bookingDate).toISOString(),
        totalAmount: selectedService.price
      });
      if (result.success) {
        toast.success('Service booked successfully!');
        setSelectedService(null);
        setBookingDate('');
      } else {
        toast.error(result.message || 'Booking failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book service');
    } finally {
      setBookingLoading(false);
    }
  };

  const clearFilters = () => setFilters({ category: '', location: '', minPrice: '', maxPrice: '', search: '' });

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  if (loading && isFirstLoad.current) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner animation="border" variant="danger" />
    </div>
  );

  return (
    <div className="services-page">
      <Container fluid>
        <Row className="hero-section mb-4">
          <Col xs={12}>
            <div className="hero-content text-center">
              <h1 className="hero-title">Find Wedding Services</h1>
              <p className="hero-subtitle">Discover and book the perfect services for your special day</p>
            </div>
          </Col>
        </Row>

        {/* Filters */}
        <Row className="mb-4">
          <Col xs={12}>
            <Card className="filters-card">
              <Card.Header><strong>🔍 Search & Filters</strong></Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col xs={12} md={3}>
                    <Form.Control type="text" name="search" value={filters.search} onChange={handleFilterChange} placeholder="Search services..." />
                  </Col>
                  <Col xs={12} md={3}>
                    <Form.Select name="category" value={filters.category} onChange={handleFilterChange}>
                      <option value="">All Categories</option>
                      {Object.keys(CATEGORY_ICONS).map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                    </Form.Select>
                  </Col>
                  <Col xs={12} md={3}>
                    <Form.Control type="text" name="location" value={filters.location} onChange={handleFilterChange} placeholder="Location..." />
                  </Col>
                  <Col xs={6} md={1}>
                    <Form.Control type="number" name="minPrice" value={filters.minPrice} onChange={handleFilterChange} placeholder="Min ₹" />
                  </Col>
                  <Col xs={6} md={1}>
                    <Form.Control type="number" name="maxPrice" value={filters.maxPrice} onChange={handleFilterChange} placeholder="Max ₹" />
                  </Col>
                  <Col xs={12} md={1}>
                    <Button variant="outline-secondary" onClick={clearFilters} className="w-100">Clear</Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Services Grid */}
        <Row className="mb-2">
          <Col xs={12}>
            <div className="d-flex align-items-center gap-2 mb-3">
              <h5 className="mb-0">Available Services ({services.length})</h5>
              {loading && <Spinner animation="border" size="sm" variant="danger" />}
            </div>
          </Col>
        </Row>

        {services.length === 0 && !loading ? (
          <Card><Card.Body className="text-center py-5">
            <div style={{ fontSize: '3rem' }}>🔍</div>
            <h4 className="text-muted mt-2">No services found</h4>
            <p className="text-muted">Try adjusting your filters</p>
          </Card.Body></Card>
        ) : (
          <Row className="g-3">
            {services.map((service) => {
              const imageUrl = service.images?.[0] ? `${UPLOAD_URL}${service.images[0]}` : null;
              const id = service._id || service.service_id;
              return (
                <Col xs={12} md={6} lg={4} key={id}>
                  <Card className="service-card h-100" style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.12)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                  >
                    {/* Service Image */}
                    <div style={{
                      height: 160, borderRadius: '12px 12px 0 0', overflow: 'hidden',
                      background: imageUrl ? `url(${imageUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #fff0f7, #f0f4ff)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {!imageUrl && <span style={{ fontSize: '3.5rem' }}>{CATEGORY_ICONS[service.category] || '💍'}</span>}
                    </div>

                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="service-title mb-0">{service.title || 'Service'}</h5>
                        <Badge bg="primary" style={{ textTransform: 'capitalize' }}>{service.category}</Badge>
                      </div>

                      {/* Rating */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                        <StarRating rating={service.avg_rating || 0} size="0.9rem" />
                        <small style={{ color: '#888' }}>
                          {service.avg_rating ? service.avg_rating.toFixed(1) : 'No rating'} ({service.review_count || 0})
                        </small>
                      </div>

                      <p className="service-description text-muted" style={{ fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '0.8rem' }}>
                        {service.description?.length > 90 ? service.description.slice(0, 90) + '...' : service.description}
                      </p>

                      <div style={{ fontSize: '0.82rem', color: '#666', marginBottom: '1rem' }}>
                        <span>👤 {service.vendor?.full_name || 'Vendor'}</span>
                        <span className="ms-3">📍 {service.location}</span>
                      </div>

                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#e91e8c', marginBottom: '0.8rem' }}>
                        {formatPrice(service.price)}
                      </div>

                      <div className="d-flex gap-2">
                        <Button
                          size="sm" variant="outline-danger" className="flex-fill"
                          onClick={() => navigate(`/services/${id}`)}
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm" variant="danger" className="flex-fill"
                          onClick={() => { setSelectedService(service); setBookingDate(''); }}
                          style={{ background: '#e91e8c', borderColor: '#e91e8c' }}
                        >
                          Book Now
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}

        {/* Quick Booking Modal */}
        <Modal show={!!selectedService} onHide={() => setSelectedService(null)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Book: {selectedService?.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="text-muted">{selectedService?.description}</p>
            <p><strong>Vendor:</strong> {selectedService?.vendor?.full_name}</p>
            <p><strong>Price:</strong> {formatPrice(selectedService?.price)}</p>
            <Form onSubmit={handleBookingSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Booking Date</Form.Label>
                <Form.Control type="date" value={bookingDate} min={minDateStr} onChange={e => setBookingDate(e.target.value)} required />
              </Form.Group>
              <div className="d-grid">
                <Button type="submit" disabled={bookingLoading} style={{ background: '#e91e8c', borderColor: '#e91e8c' }}>
                  {bookingLoading ? <><Spinner size="sm" animation="border" className="me-2" />Booking...</> : 'Confirm Booking'}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
};

export default Services;
