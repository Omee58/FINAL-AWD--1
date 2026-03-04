import { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Modal, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { vendorAPI, formatPrice, UPLOAD_URL } from '../../services/api';

const CATEGORIES = ['photography', 'catering', 'decoration', 'music', 'transport', 'makeup', 'venue', 'other'];
const CATEGORY_ICONS = { photography: '📸', catering: '🍽️', decoration: '🌸', music: '🎵', transport: '🚗', makeup: '💄', venue: '🏛️', other: '💍' };

const emptyForm = { title: '', description: '', price: '', category: '', location: '', status: 'active' };

const VendorServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingService, setDeletingService] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await vendorAPI.getMyServices();
      setServices(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error('Your account needs admin verification before managing services.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to fetch services');
      }
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingService(null);
    setForm(emptyForm);
    setSelectedFiles([]);
    setPreviewUrls([]);
    setShowModal(true);
  };

  const openEdit = (service) => {
    setEditingService(service);
    setForm({
      title: service.title || '',
      description: service.description || '',
      price: service.price || '',
      category: service.category || '',
      location: service.location || '',
      status: service.status || 'active',
    });
    setSelectedFiles([]);
    setPreviewUrls([]);
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    setSelectedFiles(prev => [...prev, ...files]);
    const urls = files.map(f => URL.createObjectURL(f));
    setPreviewUrls(prev => [...prev, ...urls]);
  };

  const removePreview = (index) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.price || !form.category || !form.location) {
      toast.error('All fields are required');
      return;
    }
    if (isNaN(form.price) || parseFloat(form.price) <= 0) {
      toast.error('Price must be a positive number');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('price', parseFloat(form.price));
      formData.append('category', form.category);
      formData.append('location', form.location);
      if (editingService) formData.append('status', form.status);
      selectedFiles.forEach(f => formData.append('images', f));

      if (editingService) {
        await vendorAPI.updateService(editingService._id || editingService.service_id, formData);
        toast.success('Service updated successfully!');
      } else {
        await vendorAPI.addService(formData);
        toast.success('Service added successfully!');
      }
      setShowModal(false);
      fetchServices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save service');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingService) return;
    try {
      setDeleteLoading(true);
      await vendorAPI.deleteService(deletingService._id || deletingService.service_id);
      toast.success('Service deleted successfully');
      setShowDeleteModal(false);
      fetchServices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete service');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) return (
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
              <h1 className="hero-title">My Services</h1>
              <p className="hero-subtitle">Manage your service offerings</p>
            </div>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col xs={12}>
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">My Services ({services.length})</h5>
              <Button onClick={openAdd} style={{ background: '#e91e8c', borderColor: '#e91e8c' }}>
                + Add New Service
              </Button>
            </div>
          </Col>
        </Row>

        {services.length === 0 ? (
          <Card><Card.Body className="text-center py-5">
            <div style={{ fontSize: '3rem' }}>📦</div>
            <h4 className="text-muted mt-2">No services yet</h4>
            <p className="text-muted">Start by adding your first service</p>
            <Button onClick={openAdd} style={{ background: '#e91e8c', borderColor: '#e91e8c' }}>
              Add Your First Service
            </Button>
          </Card.Body></Card>
        ) : (
          <Row className="g-3">
            {services.map((service) => {
              const id = service._id || service.service_id;
              const imageUrl = service.images?.[0] ? `${UPLOAD_URL}${service.images[0]}` : null;
              return (
                <Col xs={12} md={6} lg={4} key={id}>
                  <Card className="service-card h-100">
                    {/* Image */}
                    <div style={{
                      height: 160, borderRadius: '12px 12px 0 0', overflow: 'hidden',
                      background: imageUrl
                        ? `url(${imageUrl}) center/cover no-repeat`
                        : 'linear-gradient(135deg, #fff0f7, #f0f4ff)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {!imageUrl && <span style={{ fontSize: '3rem' }}>{CATEGORY_ICONS[service.category] || '💍'}</span>}
                    </div>

                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="service-title mb-0">{service.title}</h5>
                        <Badge bg={service.status === 'active' ? 'success' : 'secondary'}>
                          {service.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-muted" style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
                        {service.description?.length > 80 ? service.description.slice(0, 80) + '...' : service.description}
                      </p>
                      <div style={{ fontSize: '0.82rem', color: '#666', marginBottom: '0.8rem' }}>
                        <span>📂 {service.category}</span>
                        <span className="ms-3">📍 {service.location}</span>
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#e91e8c', marginBottom: '1rem' }}>
                        {formatPrice(service.price)}
                      </div>
                      {service.images?.length > 0 && (
                        <div style={{ display: 'flex', gap: 4, marginBottom: '0.8rem', flexWrap: 'wrap' }}>
                          {service.images.slice(0, 3).map((img, i) => (
                            <img key={i} src={`${UPLOAD_URL}${img}`} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />
                          ))}
                          {service.images.length > 3 && (
                            <div style={{ width: 40, height: 40, borderRadius: 6, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#666' }}>
                              +{service.images.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="d-flex gap-2">
                        <Button size="sm" variant="outline-danger" className="flex-fill" onClick={() => openEdit(service)}>Edit</Button>
                        <Button size="sm" variant="outline-secondary" className="flex-fill" onClick={() => { setDeletingService(service); setShowDeleteModal(true); }}>Delete</Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}

        {/* Add/Edit Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>{editingService ? 'Edit Service' : 'Add New Service'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Row className="g-3">
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>Service Title *</Form.Label>
                    <Form.Control value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Premium Wedding Photography" required />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>Category *</Form.Label>
                    <Form.Select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} required>
                      <option value="">Select Category</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label>Description *</Form.Label>
                    <Form.Control as="textarea" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe your service in detail..." required />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>Price (₹) *</Form.Label>
                    <Form.Control type="number" min="0" step="1" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="e.g. 25000" required />
                  </Form.Group>
                </Col>
                <Col xs={12} md={editingService ? 4 : 6}>
                  <Form.Group>
                    <Form.Label>Location *</Form.Label>
                    <Form.Control value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Mumbai, Maharashtra" required />
                  </Form.Group>
                </Col>
                {editingService && (
                  <Col xs={12} md={2}>
                    <Form.Group>
                      <Form.Label>Status</Form.Label>
                      <Form.Select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                )}

                {/* Image Upload */}
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label>Service Images (up to 5)</Form.Label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        border: '2px dashed #e91e8c44', borderRadius: 10, padding: '1.2rem',
                        textAlign: 'center', cursor: 'pointer', background: '#fff8fc',
                        transition: 'border-color 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#e91e8c'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#e91e8c44'}
                    >
                      <div style={{ fontSize: '2rem' }}>📷</div>
                      <div style={{ color: '#e91e8c', fontWeight: 600, fontSize: '0.9rem' }}>Click to upload images</div>
                      <div style={{ color: '#999', fontSize: '0.78rem' }}>JPEG, PNG, WebP · Max 5MB each · Up to 5 images</div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />

                    {/* Existing images (edit mode) */}
                    {editingService?.images?.length > 0 && previewUrls.length === 0 && (
                      <div style={{ marginTop: '0.8rem' }}>
                        <small className="text-muted">Current images:</small>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                          {editingService.images.map((img, i) => (
                            <img key={i} src={`${UPLOAD_URL}${img}`} alt="" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '2px solid #eee' }} />
                          ))}
                        </div>
                        <small className="text-muted d-block mt-1">Upload new images to replace existing ones</small>
                      </div>
                    )}

                    {/* New image previews */}
                    {previewUrls.length > 0 && (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: '0.8rem' }}>
                        {previewUrls.map((url, i) => (
                          <div key={i} style={{ position: 'relative' }}>
                            <img src={url} alt="" style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 8, border: '2px solid #e91e8c' }} />
                            <button
                              type="button"
                              onClick={() => removePreview(i)}
                              style={{
                                position: 'absolute', top: -6, right: -6, width: 20, height: 20,
                                borderRadius: '50%', border: 'none', background: '#e91e8c', color: '#fff',
                                fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                padding: 0, lineHeight: 1,
                              }}
                            >×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex gap-2 mt-4">
                <Button type="submit" disabled={submitting} style={{ background: '#e91e8c', borderColor: '#e91e8c', flex: 1 }}>
                  {submitting ? <><Spinner size="sm" animation="border" className="me-2" />Saving...</> : (editingService ? 'Update Service' : 'Add Service')}
                </Button>
                <Button variant="outline-secondary" onClick={() => setShowModal(false)} disabled={submitting} style={{ flex: 1 }}>
                  Cancel
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Delete Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to delete <strong>{deletingService?.title}</strong>?</p>
            <p style={{ fontSize: '0.85rem', color: '#666' }}>
              Category: {deletingService?.category} · {formatPrice(deletingService?.price)}
            </p>
            <div className="alert alert-warning" style={{ fontSize: '0.85rem' }}>
              ⚠️ This action cannot be undone. Services with active bookings cannot be deleted.
            </div>
            <div className="d-flex gap-2">
              <Button variant="danger" onClick={confirmDelete} disabled={deleteLoading} style={{ flex: 1 }}>
                {deleteLoading ? <><Spinner size="sm" animation="border" className="me-2" />Deleting...</> : 'Delete Service'}
              </Button>
              <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)} disabled={deleteLoading} style={{ flex: 1 }}>
                Cancel
              </Button>
            </div>
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
};

export default VendorServices;
