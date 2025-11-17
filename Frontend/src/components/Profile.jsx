import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateProfile, updatePassword } = useAuth();

  const [profileData, setProfileData] = useState({
    full_name: '',
    phone: ''
  });

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!profileData.full_name.trim()) {
      setError('Full name is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const result = await updateProfile(profileData);

      if (result.success) {
        setSuccess('Profile updated successfully!');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordData.old_password || !passwordData.new_password || !passwordData.confirm_password) {
      setPasswordError('All password fields are required');
      return;
    }

    if (passwordData.new_password.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      setPasswordLoading(true);
      setPasswordError('');
      setPasswordSuccess('');

      const result = await updatePassword({
        old_password: passwordData.old_password,
        password: passwordData.new_password
      });

      if (result.success) {
        setPasswordSuccess('Password updated successfully!');
        setPasswordData({
          old_password: '',
          new_password: '',
          confirm_password: ''
        });
      } else {
        setPasswordError(result.error);
      }
    } catch (err) {
      setPasswordError('Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="profile-page">
        <Container fluid className="h-100">
          <Row className="h-100 align-items-center justify-content-center">
            <Col xs={12} className="text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Container fluid className="h-100">
        {/* Hero Section */}
        <Row className="hero-section mb-5">
          <Col xs={12}>
            <div className="hero-content text-center">
              <h1 className="hero-title">My Profile</h1>
              <p className="hero-subtitle">Manage your account information</p>
            </div>
          </Col>
        </Row>

        <Row>
          {/* Profile Information */}
          <Col xs={12} lg={6} className="mb-4">
            <Card className="profile-card h-100">
              <Card.Header>
                <h2 className="section-title mb-0">
                  <i className="fas fa-user me-2"></i>
                  Profile Information
                </h2>
              </Card.Header>
              <Card.Body>
                {error && (
                  <Alert variant="danger" dismissible onClose={() => setError('')}>
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert variant="success" dismissible onClose={() => setSuccess('')}>
                    {success}
                  </Alert>
                )}

                <Form onSubmit={handleProfileSubmit}>
                  <Form.Group className="profile-form-group">
                    <Form.Label className="profile-label">Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="full_name"
                      value={profileData.full_name}
                      onChange={handleProfileChange}
                      placeholder="Enter your full name"
                      className="profile-input"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="profile-form-group">
                    <Form.Label className="profile-label">Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      value={user.email}
                      className="profile-input"
                      disabled
                    />
                    <Form.Text className="profile-help-text">
                      Email cannot be changed
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="profile-form-group">
                    <Form.Label className="profile-label">Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      placeholder="Enter your phone number"
                      className="profile-input"
                      required
                    />
                  </Form.Group>

                  <div className="profile-button-wrapper">
                    <Button
                      type="submit"
                      className="profile-button"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Updating...
                        </>
                      ) : (
                        'Update Profile'
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Change Password */}
          <Col xs={12} lg={6} className="mb-4">
            <Card className="profile-card h-100">
              <Card.Header>
                <h2 className="section-title mb-0">
                  <i className="fas fa-lock me-2"></i>
                  Change Password
                </h2>
              </Card.Header>
              <Card.Body>
                {passwordError && (
                  <Alert variant="danger" dismissible onClose={() => setPasswordError('')}>
                    {passwordError}
                  </Alert>
                )}
                {passwordSuccess && (
                  <Alert variant="success" dismissible onClose={() => setPasswordSuccess('')}>
                    {passwordSuccess}
                  </Alert>
                )}
                <Form onSubmit={handlePasswordSubmit}>
                  <Form.Group className="profile-form-group">
                    <Form.Label className="profile-label">Current Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="old_password"
                      value={passwordData.old_password}
                      onChange={handlePasswordChange}
                      placeholder="Enter current password"
                      className="profile-input"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="profile-form-group">
                    <Form.Label className="profile-label">New Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="new_password"
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password"
                      className="profile-input"
                      required
                    />
                    <Form.Text className="profile-help-text">
                      Minimum 6 characters
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="profile-form-group">
                    <Form.Label className="profile-label">Confirm New Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirm_password"
                      value={passwordData.confirm_password}
                      onChange={handlePasswordChange}
                      placeholder="Confirm new password"
                      className="profile-input"
                      required
                    />
                  </Form.Group>

                  <div className="profile-button-wrapper">
                    <Button
                      type="submit"
                      variant="outline-primary"
                      className="profile-button"
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Updating...
                        </>
                      ) : (
                        'Change Password'
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Profile;
