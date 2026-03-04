import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      background: 'linear-gradient(135deg, #fff5f9, #f0f4ff)', padding: '2rem',
    }}>
      <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>💍</div>
      <h1 style={{ fontSize: '6rem', fontWeight: 900, color: '#e91e8c', margin: 0, lineHeight: 1 }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', color: '#1a1a2e', margin: '1rem 0 0.5rem' }}>Page Not Found</h2>
      <p style={{ color: '#666', marginBottom: '2rem', maxWidth: 400 }}>
        Oops! The page you're looking for doesn't exist. It may have been moved or deleted.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/" style={{
          padding: '0.8rem 2rem', background: '#e91e8c', color: '#fff',
          borderRadius: '25px', textDecoration: 'none', fontWeight: 700,
        }}>
          Go Home
        </Link>
        <Link to="/login" style={{
          padding: '0.8rem 2rem', border: '2px solid #e91e8c', color: '#e91e8c',
          borderRadius: '25px', textDecoration: 'none', fontWeight: 700,
        }}>
          Login
        </Link>
      </div>
    </div>
  );
}
