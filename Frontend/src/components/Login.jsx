import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const result = await login(formData);
      console.log('Login: Login result:', result);

      if (result.success) {
        // AuthContext will handle the redirect based on user role
        console.log('Login: Login successful, AuthContext will handle redirect');
      } else {
        setError(result.message || result.error);
        // alert(result.message || result.error)
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Container fluid className="h-100">
        <Row className="h-100 align-items-center justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6} xl={5} xxl={4}>
            {/* Logo and Header */}
            <div className="text-center mb-4">
              <div className="mb-3">
                <h1 className="auth-title">ShadiSeva</h1>
                <p className="auth-subtitle">Your Wedding Partner</p>
              </div>
            </div>

            {/* Login Card */}
            <Card className="auth-card">
              <Card.Body className="auth-card-body">
                <div className="text-center mb-4">
                  <h2 className="auth-card-title">Welcome Back</h2>
                  <p className="auth-card-subtitle">Sign in to your account to continue</p>
                </div>

                {error && (
                  <Alert variant="danger" className="auth-alert" dismissible onClose={() => setError('')}>
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
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
                    <Form.Label className="auth-label">Password</Form.Label>
                    <div className="auth-input-wrapper">
                      <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        className="auth-input"
                        required
                      />
                      <div className="auth-input-icon">
                        <i className="fas fa-lock"></i>
                      </div>
                    </div>
                  </Form.Group>

                  <div className="auth-button-wrapper">
                    <Button
                      type="submit"
                      className="auth-button"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Signing In...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </div>
                </Form>

                <hr className="auth-divider" />

                <div className="text-center">
                  <p className="auth-link-text">
                    Don't have an account?{' '}
                    <Link to="/register" className="auth-link">
                      Sign up here
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

export default Login;
