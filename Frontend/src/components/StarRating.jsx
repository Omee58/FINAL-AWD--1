export default function StarRating({ rating = 0, max = 5, interactive = false, onRate, size = '1.2rem' }) {
  return (
    <div style={{ display: 'inline-flex', gap: '2px' }}>
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <span
          key={star}
          onClick={() => interactive && onRate && onRate(star)}
          style={{
            fontSize: size,
            cursor: interactive ? 'pointer' : 'default',
            color: star <= rating ? '#ffc107' : '#ddd',
            transition: 'color 0.15s',
            userSelect: 'none',
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}
