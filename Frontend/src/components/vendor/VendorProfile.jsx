import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { vendorAPI } from '../../services/api';

const VendorProfile = () => {
  const { updateProfile, updatePassword } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Profile update states
  const [profileData, setProfileData] = useState({
    full_name: '',
    phone: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Password update states
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    console.log('VendorProfile: Component mounted, fetching profile...');
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      console.log('VendorProfile: Fetching vendor profile...');
      setLoading(true);
      setError('');

      const response = await vendorAPI.getProfile();
      console.log('VendorProfile: Profile response:', response);

      if (response.success && response.data && response.data.vendor) {
        const vendorData = response.data.vendor;
        setProfile(vendorData);
        setProfileData({
          full_name: vendorData.full_name || '',
          phone: vendorData.phone || ''
        });
      } else {
        throw new Error('Invalid profile data received');
      }
    } catch (err) {
      console.error('VendorProfile: Error fetching profile:', err);
      
      // Handle 403 Forbidden (unverified vendor)
      if (err.response?.status === 403) {
        setError('Your vendor account needs to be verified by an administrator before you can access your profile.');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch profile. Please check if the backend server is running.');
      }
    } finally {
      setLoading(false);
    }
  };

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
    
    try {
      setProfileLoading(true);
      setProfileError('');
      setProfileSuccess('');

      const result = await updateProfile(profileData);
      
      if (result.success) {
        setProfileSuccess('Profile updated successfully!');
        fetchProfile(); // Refresh profile data
      } else {
        setProfileError(result.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('VendorProfile: Error updating profile:', err);
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    // Validate passwords match
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('New passwords do not match');
      return;
    }

    // Validate password length
    if (passwordData.new_password.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    try {
      setPasswordLoading(true);
      setPasswordError('');
      setPasswordSuccess('');

      const result = await updatePassword({
        old_password: passwordData.current_password,
        password: passwordData.new_password
      });
      
      if (result.success) {
        setPasswordSuccess('Password updated successfully!');
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
      } else {
        setPasswordError(result.message || 'Failed to update password');
      }
    } catch (err) {
      console.error('VendorProfile: Error updating password:', err);
      setPasswordError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
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
    <div className="profile-page">
      <Container fluid className="h-100">
        {/* Hero Section */}
        <Row className="hero-section mb-5">
          <Col xs={12}>
            <div className="hero-content text-center">
              <h1 className="hero-title">Vendor Profile</h1>
              <p className="hero-subtitle">Manage your account information</p>
            </div>
          </Col>
        </Row>

        {/* Error Alert */}
        {error && (
          <Row className="mb-4">
            <Col xs={12}>
              <Alert variant="danger" dismissible onClose={() => setError('')}>
                <h5>Error Loading Profile</h5>
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

        <Row>
          {/* Profile Information */}
          <Col xs={12} lg={6} className="mb-4">
            <Card className="profile-card">
              <Card.Header>
                <h2 className="section-title mb-0">
                  <i className="fas fa-user me-2"></i>
                  Profile Information
                </h2>
              </Card.Header>
              <Card.Body>
                {profile && (
                  <div className="mb-4">
                    <div className="row mb-3">
                      <div className="col-4">
                        <strong>Full Name:</strong>
                      </div>
                      <div className="col-8">
                        {profile.full_name || 'Not provided'}
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-4">
                        <strong>Email:</strong>
                      </div>
                      <div className="col-8">
                        {profile.email || 'Not provided'}
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-4">
                        <strong>Phone:</strong>
                      </div>
                      <div className="col-8">
                        {profile.phone || 'Not provided'}
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-4">
                        <strong>Role:</strong>
                      </div>
                      <div className="col-8">
                        <span className="badge bg-primary">{profile.role || 'vendor'}</span>
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-4">
                        <strong>Member Since:</strong>
                      </div>
                      <div className="col-8">
                        {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Profile Update Form */}
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

                  <Form.Group className="profile-form-group">
                    <Form.Label className="profile-label">Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="full_name"
                      value={profileData.full_name}
                      onChange={handleProfileChange}
                      className="profile-input"
                      placeholder="Enter your full name"
                    />
                    <Form.Text className="profile-help-text">
                      Update your business or personal name
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="profile-form-group">
                    <Form.Label className="profile-label">Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      className="profile-input"
                      placeholder="Enter your phone number"
                    />
                    <Form.Text className="profile-help-text">
                      Update your contact phone number
                    </Form.Text>
                  </Form.Group>

                  <div className="profile-button-wrapper">
                    <Button
                      type="submit"
                      variant="primary"
                      className="profile-button"
                      disabled={profileLoading}
                    >
                      {profileLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Updating...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-2"></i>
                          Update Profile
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Password Update */}
          <Col xs={12} lg={6} className="mb-4">
            <Card className="profile-card">
              <Card.Header>
                <h2 className="section-title mb-0">
                  <i className="fas fa-lock me-2"></i>
                  Change Password
                </h2>
              </Card.Header>
              <Card.Body>
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

                  <Form.Group className="profile-form-group">
                    <Form.Label className="profile-label">Current Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="current_password"
                      value={passwordData.current_password}
                      onChange={handlePasswordChange}
                      className="profile-input"
                      placeholder="Enter your current password"
                      required
                    />
                    <Form.Text className="profile-help-text">
                      Enter your current password to verify your identity
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="profile-form-group">
                    <Form.Label className="profile-label">New Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="new_password"
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                      className="profile-input"
                      placeholder="Enter your new password"
                      required
                    />
                    <Form.Text className="profile-help-text">
                      Password must be at least 6 characters long
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="profile-form-group">
                    <Form.Label className="profile-label">Confirm New Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirm_password"
                      value={passwordData.confirm_password}
                      onChange={handlePasswordChange}
                      className="profile-input"
                      placeholder="Confirm your new password"
                      required
                    />
                    <Form.Text className="profile-help-text">
                      Re-enter your new password to confirm
                    </Form.Text>
                  </Form.Group>

                  <div className="profile-button-wrapper">
                    <Button
                      type="submit"
                      variant="warning"
                      className="profile-button"
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Updating...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-key me-2"></i>
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

export default VendorProfile;
