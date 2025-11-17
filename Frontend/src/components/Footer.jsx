import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <Container>
        <Row className="align-items-center">
          <Col xs={12} md={6} className="text-center text-md-start">
            <div className="footer-brand">
              <h5 className="mb-1">ShadiSeva</h5>
              <p className="mb-0">Your Wedding Partner</p>
            </div>
          </Col>
          <Col xs={12} md={6} className="text-center text-md-end">
            <div className="footer-links">
              <span className="me-3">
                <i className="fas fa-phone me-1"></i>
                +91 98765 43210
              </span>
              <span className="me-3">
                <i className="fas fa-envelope me-1"></i>
                info@shadiseva.com
              </span>
            </div>
            <div className="footer-copyright mt-2">
              <small>&copy; {currentYear} ShadiSeva. All rights reserved.</small>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
