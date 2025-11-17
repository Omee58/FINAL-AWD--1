import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    role: 'client'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      setError('Full name is required');
      return false;
    }
    
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const result = await register({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role
      });
      
      if (result.success) {
        // AuthContext will handle the redirect based on user role
        console.log('Register: Registration successful, AuthContext will handle redirect');
      } else {
        setError(result.message || result.error);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Container fluid className="h-100">
        <Row className="h-100 align-items-center justify-content-center">
          <Col xs={12} sm={11} md={10} lg={8} xl={7} xxl={6}>
            {/* Logo and Header */}
            <div className="text-center mb-4">
              <div className="mb-3">
                <h1 className="auth-title">ShadiSeva</h1>
                <p className="auth-subtitle">Your Wedding Partner</p>
              </div>
            </div>
            
            {/* Register Card */}
            <Card className="auth-card">
              <Card.Body className="auth-card-body">
                <div className="text-center mb-4">
                  <h2 className="auth-card-title">Create Account</h2>
                  <p className="auth-card-subtitle">Join us to start your wedding journey</p>
                </div>
                
                {error && (
                  <Alert variant="danger" className="auth-alert" dismissible onClose={() => setError('')}>
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                  </Alert>
                )}
                
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col xs={12} md={6}>
                      <Form.Group className="auth-form-group">
                        <Form.Label className="auth-label">Full Name</Form.Label>
                        <div className="auth-input-wrapper">
                          <Form.Control
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            className="auth-input"
                            required
                          />
                          <div className="auth-input-icon">
                            <i className="fas fa-user"></i>
                          </div>
                        </div>
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group className="auth-form-group">
                        <Form.Label className="auth-label">Phone Number</Form.Label>
                        <div className="auth-input-wrapper">
                          <Form.Control
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter your phone number"
                            className="auth-input"
                            required
                          />
                          <div className="auth-input-icon">
                            <i className="fas fa-phone"></i>
                          </div>
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="auth-form-group">
                    <Form.Label className="auth-label">Email Address</Form.Label>
                    <div className="auth-input-wrapper">
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email address"
                        className="auth-input"
                        required
                      />
                      <div className="auth-input-icon">
                        <i className="fas fa-envelope"></i>
                      </div>
                    </div>
                  </Form.Group>
                  
                  <Form.Group className="auth-form-group">
                    <Form.Label className="auth-label">Account Type</Form.Label>
                    <div className="auth-input-wrapper">
                      <Form.Select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="auth-input"
                      >
                        <option value="client">👤 Client - I want to book services</option>
                        <option value="vendor">🏢 Vendor - I want to provide services</option>
                      </Form.Select>
                    </div>
                    <Form.Text className="auth-help-text">
                      Choose your account type. Clients can book services, vendors can provide services.
                    </Form.Text>
                  </Form.Group>
                  
                  <Row>
                    <Col xs={12} md={6}>
                      <Form.Group className="auth-form-group">
                        <Form.Label className="auth-label">Password</Form.Label>
                        <div className="auth-input-wrapper">
                          <Form.Control
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            className="auth-input"
                            required
                          />
                          <div className="auth-input-icon">
                            <i className="fas fa-lock"></i>
                          </div>
                        </div>
                        <Form.Text className="auth-help-text">
                          Minimum 6 characters
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group className="auth-form-group">
                        <Form.Label className="auth-label">Confirm Password</Form.Label>
                        <div className="auth-input-wrapper">
                          <Form.Control
                            type="password"
                            name="confirm_password"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            placeholder="Confirm password"
                            className="auth-input"
                            required
                          />
                          <div className="auth-input-icon">
                            <i className="fas fa-lock"></i>
                          </div>
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <div className="auth-button-wrapper">
                    <Button 
                      type="submit" 
                      className="auth-button"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </div>
                </Form>
                
                <hr className="auth-divider" />
                
                <div className="text-center">
                  <p className="auth-link-text">
                    Already have an account?{' '}
                    <Link to="/login" className="auth-link">
                      Sign in here
                    </Link>
                  </p>
                </div>
              </Card.Body>
            </Card>
            
            {/* Footer */}
            <div className="text-center mt-4">
              <p className="auth-footer">
                © 2025 ShadiSeva. All rights reserved.
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register;
