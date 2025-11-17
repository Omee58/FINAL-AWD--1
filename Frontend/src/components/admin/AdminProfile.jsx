import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const AdminProfile = () => {
  const { user, updateProfile, updatePassword } = useAuth();
  
  // Profile form states
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Password form states
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Show password states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        full_name: user.full_name || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!profileForm.full_name.trim()) {
      setProfileError('Full name is required');
      return;
    }

    try {
      setProfileLoading(true);
      setProfileError('');
      setProfileSuccess('');

      const result = await updateProfile(profileForm);
      
      if (result.success) {
        setProfileSuccess('Profile updated successfully!');
        // Clear form after successful update
        setTimeout(() => {
          setProfileSuccess('');
        }, 3000);
      } else {
        setProfileError(result.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('AdminProfile: Error updating profile:', err);
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!passwordForm.current_password.trim()) {
      setPasswordError('Current password is required');
      return;
    }
    
    if (!passwordForm.new_password.trim()) {
      setPasswordError('New password is required');
      return;
    }
    
    if (passwordForm.new_password.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      setPasswordLoading(true);
      setPasswordError('');
      setPasswordSuccess('');

      const result = await updatePassword({
        old_password: passwordForm.current_password,
        password: passwordForm.new_password
      });
      
      if (result.success) {
        setPasswordSuccess('Password updated successfully!');
        // Clear form after successful update
        setPasswordForm({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
        setTimeout(() => {
          setPasswordSuccess('');
        }, 3000);
      } else {
        setPasswordError(result.message || 'Failed to update password');
      }
    } catch (err) {
      console.error('AdminProfile: Error updating password:', err);
      setPasswordError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="dashboard-page">
        <Container fluid className="h-100">
          <Row className="h-100 align-items-center justify-content-center">
            <Col xs={12} className="text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-3">Loading profile...</p>
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
              <h1 className="hero-title">Admin Profile</h1>
              <p className="hero-subtitle">Manage your account settings</p>
            </div>
          </Col>
        </Row>

        <Row>
          {/* Profile Information Card */}
          <Col xs={12} lg={6} className="mb-4">
            <Card className="h-100">
              <Card.Header>
                <h2 className="section-title mb-0">
                  <i className="fas fa-user me-2"></i>
                  Profile Information
                </h2>
              </Card.Header>
              <Card.Body>
                <div className="mb-4">
                  <h5>Current Information</h5>
                  <div className="profile-info">
                    <p><strong>Name:</strong> {user.full_name}</p>
                    <p><strong>Email:</strong> {user.email} <span className="text-muted">(Cannot be changed)</span></p>
                    <p><strong>Phone:</strong> {user.phone || 'Not set'}</p>
                    <p><strong>Role:</strong> <span className="badge bg-primary">{user.role}</span></p>
                  </div>
                </div>

                <Form onSubmit={handleProfileSubmit}>
                  {profileError && (
                    <Alert variant="danger" dismissible onClose={() => setProfileError('')}>
                      {profileError}
                    </Alert>
                  )}
                  
                  {profileSuccess && (
                    <Alert variant="success" dismissible onClose={() => setProfileSuccess('')}>
                      {profileSuccess}
                    </Alert>
                  )}

                  <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="full_name"
                      value={profileForm.full_name}
                      onChange={handleProfileChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                      placeholder="Enter your phone number"
                    />
                  </Form.Group>

                  <div className="d-grid">
                    <Button 
                      type="submit" 
                      variant="primary"
                      disabled={profileLoading}
                    >
                      {profileLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Updating...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-1"></i>
                          Update Profile
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Password Update Card */}
          <Col xs={12} lg={6} className="mb-4">
            <Card className="h-100">
              <Card.Header>
                <h2 className="section-title mb-0">
                  <i className="fas fa-lock me-2"></i>
                  Change Password
                </h2>
              </Card.Header>
              <Card.Body>
                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>Security Note:</strong> Choose a strong password with at least 6 characters.
                </div>

                <Form onSubmit={handlePasswordSubmit}>
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

                  <Form.Group className="mb-3">
                    <Form.Label>Current Password</Form.Label>
                    <div className="input-group">
                      <Form.Control
                        type={showCurrentPassword ? "text" : "password"}
                        name="current_password"
                        value={passwordForm.current_password}
                        onChange={handlePasswordChange}
                        placeholder="Enter current password"
                        required
                      />
                      <Button
                        variant="outline-secondary"
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        <i className={`fas fa-${showCurrentPassword ? 'eye-slash' : 'eye'}`}></i>
                      </Button>
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>New Password</Form.Label>
                    <div className="input-group">
                      <Form.Control
                        type={showNewPassword ? "text" : "password"}
                        name="new_password"
                        value={passwordForm.new_password}
                        onChange={handlePasswordChange}
                        placeholder="Enter new password"
                        required
                      />
                      <Button
                        variant="outline-secondary"
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        <i className={`fas fa-${showNewPassword ? 'eye-slash' : 'eye'}`}></i>
                      </Button>
                    </div>
                    <Form.Text className="text-muted">
                      Must be at least 6 characters long
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Confirm New Password</Form.Label>
                    <div className="input-group">
                      <Form.Control
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirm_password"
                        value={passwordForm.confirm_password}
                        onChange={handlePasswordChange}
                        placeholder="Confirm new password"
                        required
                      />
                      <Button
                        variant="outline-secondary"
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <i className={`fas fa-${showConfirmPassword ? 'eye-slash' : 'eye'}`}></i>
                      </Button>
                    </div>
                  </Form.Group>

                  <div className="d-grid">
                    <Button 
                      type="submit" 
                      variant="warning"
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Updating...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-key me-1"></i>
                          Change Password
                        </>
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

export default AdminProfile;
