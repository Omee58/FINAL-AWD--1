import StarRating from './StarRating';
import { formatDate } from '../services/api';

export default function ReviewCard({ review }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #f0f0f0', borderRadius: '12px',
      padding: '1.2rem 1.5rem', marginBottom: '1rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'linear-gradient(135deg, #e91e8c, #9c27b0)',
            color: '#fff', fontWeight: 700, fontSize: '0.85rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {review.client?.full_name?.charAt(0) || '?'}
          </div>
          <div>
            <strong style={{ fontSize: '0.95rem' }}>{review.client?.full_name || 'Anonymous'}</strong>
            <div><StarRating rating={review.rating} size="0.95rem" /></div>
          </div>
        </div>
        <small style={{ color: '#999' }}>{formatDate(review.createdAt)}</small>
      </div>
      {review.comment && <p style={{ margin: 0, color: '#555', fontSize: '0.9rem', lineHeight: 1.6 }}>{review.comment}</p>}
    </div>
  );
}
