import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Form, Button, Alert, Container, Row, Col, Table, Spinner } from 'react-bootstrap';

const AdminCreatePlan = () => {
  const [form, setForm] = useState({
    name: '',
    price: '',
    interval: 'monthly',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [plans, setPlans] = useState([]);
  const [fetching, setFetching] = useState(false);

  // Fetch all plans on mount
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setFetching(true);
    setError('');
    try {
      const res = await axios.get('/api/subscription-plans');
      setPlans(res.data.plans || []);
    } catch (err) {
      setError('Failed to fetch plans');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const res = await axios.post('/api/subscription-plans', {
        ...form,
        price: Number(form.price),
      });
      setSuccess('Plan created successfully!');
      setForm({ name: '', price: '', interval: 'monthly', description: '' });
      fetchPlans();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <Card>
            <Card.Body>
              <Card.Title>Create Subscription Plan</Card.Title>
              {success && <Alert variant="success">{success}</Alert>}
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Plan Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Price (INR)</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    required
                    min={1}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Interval</Form.Label>
                  <Form.Select
                    name="interval"
                    value={form.interval}
                    onChange={handleChange}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Plan'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="justify-content-center mt-5">
        <Col xs={12} md={10}>
          <Card>
            <Card.Body>
              <Card.Title>All Subscription Plans</Card.Title>
              {fetching ? (
                <div className="text-center my-4">
                  <Spinner animation="border" />
                </div>
              ) : plans.length === 0 ? (
                <div className="text-center text-muted my-4">No plans found.</div>
              ) : (
                <Table striped bordered hover responsive className="mt-3">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Price (INR)</th>
                      <th>Interval</th>
                      <th>Description</th>
                      <th>Razorpay Plan ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.map((plan, idx) => (
                      <tr key={plan._id}>
                        <td>{idx + 1}</td>
                        <td>{plan.name}</td>
                        <td>₹{Number(plan.price).toLocaleString('en-IN')}</td>
                        <td>{plan.interval.charAt(0).toUpperCase() + plan.interval.slice(1)}</td>
                        <td>{plan.description}</td>
                        <td style={{ fontSize: '0.9em', wordBreak: 'break-all' }}>{plan.razorpayPlanId}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminCreatePlan;