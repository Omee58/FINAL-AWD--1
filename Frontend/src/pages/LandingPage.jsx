import { Link } from 'react-router-dom';
import './LandingPage.css';

const categories = [
  { icon: '📸', name: 'Photography', desc: 'Capture every precious moment' },
  { icon: '🍽️', name: 'Catering', desc: 'Exquisite food for your guests' },
  { icon: '🌸', name: 'Decoration', desc: 'Transform your venue beautifully' },
  { icon: '🎵', name: 'Music & DJ', desc: 'Keep the celebration alive' },
  { icon: '💄', name: 'Makeup', desc: 'Look stunning on your big day' },
  { icon: '🚗', name: 'Transport', desc: 'Arrive in style and comfort' },
];

const steps = [
  { num: '01', title: 'Browse Services', desc: 'Explore hundreds of verified wedding vendors across all categories.' },
  { num: '02', title: 'Book Your Date', desc: 'Select your wedding date and book instantly with a few clicks.' },
  { num: '03', title: 'Celebrate', desc: 'Relax and enjoy your perfect wedding day — we handle the rest.' },
];

const stats = [
  { value: '500+', label: 'Verified Vendors' },
  { value: '2,000+', label: 'Happy Couples' },
  { value: '15+', label: 'Cities Covered' },
  { value: '4.8★', label: 'Average Rating' },
];

const testimonials = [
  {
    name: 'Priya & Arjun',
    text: 'ShadiSeva made our wedding planning so easy! Found all our vendors in one place. Highly recommend!',
    avatar: 'PA',
    location: 'Mumbai',
  },
  {
    name: 'Kavya & Rohan',
    text: 'The photography vendor we found through ShadiSeva was absolutely incredible. Our photos are breathtaking!',
    avatar: 'KR',
    location: 'Bangalore',
  },
  {
    name: 'Sneha & Vikram',
    text: 'From catering to decoration, everything was perfectly handled. Our guests are still talking about it!',
    avatar: 'SV',
    location: 'Delhi',
  },
];

export default function LandingPage() {
  return (
    <div className="landing">
      {/* ── Navbar ── */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo">
            💍 <span>ShadiSeva</span>
          </div>
          <div className="landing-nav-links">
            <a href="#services">Services</a>
            <a href="#how-it-works">How it Works</a>
            <a href="#testimonials">Reviews</a>
            <Link to="/login" className="btn-nav-login">Login</Link>
            <Link to="/register" className="btn-nav-register">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">India's #1 Wedding Platform</div>
          <h1>
            Your Perfect Wedding,<br />
            <span className="hero-highlight">Perfectly Planned</span>
          </h1>
          <p className="hero-sub">
            Connect with India's best wedding vendors — photographers, caterers,
            decorators and more. Plan everything in one place.
          </p>
          <div className="hero-cta">
            <Link to="/register" className="btn-hero-primary">Start Planning Free</Link>
            <Link to="/login" className="btn-hero-secondary">Browse Services</Link>
          </div>
          <div className="hero-stats">
            {stats.map((s) => (
              <div key={s.label} className="hero-stat">
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card main-card">
            <div className="hero-card-emoji">💍</div>
            <div>
              <p className="card-title">Dream Wedding Package</p>
              <p className="card-sub">Photography · Catering · Decor</p>
            </div>
            <span className="card-badge">Trending</span>
          </div>
          <div className="hero-card side-card top">
            <span>📸</span>
            <div>
              <p>Photography</p>
              <p>From ₹20,000</p>
            </div>
          </div>
          <div className="hero-card side-card bottom">
            <span>🌸</span>
            <div>
              <p>Decoration</p>
              <p>From ₹25,000</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="section" id="services">
        <div className="section-inner">
          <div className="section-header">
            <div className="section-tag">Our Services</div>
            <h2>Everything for Your<br /><span>Perfect Wedding</span></h2>
            <p>Browse across all wedding service categories and find the perfect vendors for your big day.</p>
          </div>
          <div className="categories-grid">
            {categories.map((cat) => (
              <div key={cat.name} className="category-card">
                <div className="category-icon">{cat.icon}</div>
                <h3>{cat.name}</h3>
                <p>{cat.desc}</p>
                <Link to="/register" className="category-link">Explore →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section className="section section-alt" id="how-it-works">
        <div className="section-inner">
          <div className="section-header">
            <div className="section-tag">Simple Process</div>
            <h2>Plan Your Wedding<br /><span>in 3 Easy Steps</span></h2>
          </div>
          <div className="steps-grid">
            {steps.map((step) => (
              <div key={step.num} className="step-card">
                <div className="step-num">{step.num}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="section" id="testimonials">
        <div className="section-inner">
          <div className="section-header">
            <div className="section-tag">Love Stories</div>
            <h2>What Couples<br /><span>Say About Us</span></h2>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t) => (
              <div key={t.name} className="testimonial-card">
                <div className="testimonial-stars">★★★★★</div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.avatar}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2>Ready to Plan Your Dream Wedding?</h2>
          <p>Join thousands of happy couples who planned their perfect wedding with ShadiSeva.</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn-cta-primary">Create Free Account</Link>
            <Link to="/register?role=vendor" className="btn-cta-secondary">Join as Vendor</Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="landing-logo">💍 <span>ShadiSeva</span></div>
            <p>India's most trusted wedding planning platform.</p>
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <a href="#services">Services</a>
          </div>
          <div className="footer-contact">
            <h4>Contact</h4>
            <p>📧 hello@shadiseva.com</p>
            <p>📞 +91-98001-23456</p>
            <p>📍 Mumbai, India</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 ShadiSeva. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
