import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { vendorAPI, clientAPI, reviewAPI, formatPrice, formatDate, UPLOAD_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import ReviewCard from '../components/ReviewCard';

export default function ServiceDetail() {
  const { serviceId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewableBookings, setReviewableBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking modal
  const [showBooking, setShowBooking] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [booking, setBooking] = useState(false);

  // Review modal
  const [showReview, setShowReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [serviceId]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [svcRes, revRes] = await Promise.all([
        vendorAPI.getProfile().then(() => null).catch(() => null), // warm up
        reviewAPI.getServiceReviews(serviceId),
      ]);

      // Fetch service via client services endpoint (filter won't work for specific id)
      // Use the public getServiceById endpoint
      const svcResponse = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/vendor/services/${serviceId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const svcData = await svcResponse.json();
      if (svcData.success) setService(svcData.data.service);

      setReviews(revRes.data || []);

      if (user?.role === 'client') {
        const reviewable = await reviewAPI.getReviewableBookings();
        const forThisService = (reviewable.data || []).filter(
          b => b.service?._id === serviceId || b.service === serviceId
        );
        setReviewableBookings(forThisService);
      }
    } catch {
      toast.error('Failed to load service details');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!bookingDate) { toast.error('Please select a booking date'); return; }
    if (!user) { navigate('/login'); return; }
    try {
      setBooking(true);
      await clientAPI.bookService({
        service_id: serviceId,
        vendor_id: service.vendor?.vendor_id,
        booking_date: bookingDate,
      });
      toast.success('Booking submitted successfully!');
      setShowBooking(false);
      setBookingDate('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  const handleReview = async () => {
    if (!selectedBookingId) { toast.error('Please select a booking to review'); return; }
    try {
      setSubmittingReview(true);
      await reviewAPI.addReview(serviceId, {
        rating: reviewRating,
        comment: reviewComment,
        booking_id: selectedBookingId,
      });
      toast.success('Review submitted! Thank you.');
      setShowReview(false);
      setReviewComment('');
      setReviewRating(5);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner-border text-danger" />
    </div>
  );

  if (!service) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
      <h4>Service not found</h4>
      <button className="btn btn-outline-danger" onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );

  const imageUrl = service.images?.[0]
    ? `${UPLOAD_URL}${service.images[0]}`
    : null;

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', paddingBottom: '4rem' }}>
      {/* Hero image */}
      <div style={{
        height: 320, background: imageUrl
          ? `url(${imageUrl}) center/cover no-repeat`
          : 'linear-gradient(135deg, #e91e8c22, #9c27b022)',
        display: 'flex', alignItems: 'flex-end',
      }}>
        {!imageUrl && (
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <span style={{ fontSize: '5rem' }}>
              {service.category === 'photography' ? '📸' : service.category === 'catering' ? '🍽️' : service.category === 'decoration' ? '🌸' : '💍'}
            </span>
          </div>
        )}
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Main card */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: '2rem',
          marginTop: -60, position: 'relative', boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          marginBottom: '2rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{
                background: '#fff0f7', color: '#e91e8c', borderRadius: 20,
                padding: '0.2rem 0.8rem', fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize',
              }}>
                {service.category}
              </span>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1a1a2e', margin: '0.5rem 0' }}>{service.title}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', color: '#666', fontSize: '0.9rem' }}>
                <StarRating rating={service.avg_rating || 0} />
                <span>{service.avg_rating?.toFixed(1) || '0.0'}</span>
                <span>·</span>
                <span>{service.review_count || 0} reviews</span>
                <span>·</span>
                <span>📍 {service.location}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#e91e8c' }}>{formatPrice(service.price)}</div>
              <small style={{ color: '#888' }}>per event</small>
            </div>
          </div>

          <hr style={{ margin: '1.5rem 0', borderColor: '#f0f0f0' }} />

          <p style={{ color: '#555', lineHeight: 1.8, marginBottom: '1.5rem' }}>{service.description}</p>

          {/* Vendor info */}
          <div style={{
            background: '#fafafa', borderRadius: 12, padding: '1rem 1.2rem',
            display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem',
          }}>
            <div style={{
              width: 50, height: 50, borderRadius: '50%',
              background: 'linear-gradient(135deg, #e91e8c, #9c27b0)',
              color: '#fff', fontWeight: 700, fontSize: '1.1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {service.vendor?.full_name?.charAt(0) || 'V'}
            </div>
            <div>
              <strong style={{ display: 'block', color: '#1a1a2e' }}>{service.vendor?.full_name}</strong>
              <small style={{ color: '#888' }}>📧 {service.vendor?.email} · 📞 {service.vendor?.phone}</small>
            </div>
          </div>

          {/* Actions */}
          {user?.role === 'client' && (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowBooking(true)}
                style={{
                  padding: '0.8rem 2rem', background: '#e91e8c', color: '#fff',
                  border: 'none', borderRadius: 25, fontWeight: 700, cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                Book Now
              </button>
              {reviewableBookings.length > 0 && (
                <button
                  onClick={() => setShowReview(true)}
                  style={{
                    padding: '0.8rem 2rem', border: '2px solid #e91e8c', color: '#e91e8c',
                    borderRadius: 25, fontWeight: 700, cursor: 'pointer', background: '#fff',
                    fontSize: '1rem',
                  }}
                >
                  ★ Write a Review
                </button>
              )}
            </div>
          )}
          {!user && (
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '0.8rem 2rem', background: '#e91e8c', color: '#fff',
                border: 'none', borderRadius: 25, fontWeight: 700, cursor: 'pointer', fontSize: '1rem',
              }}
            >
              Login to Book
            </button>
          )}
        </div>

        {/* Reviews */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontWeight: 800, color: '#1a1a2e', marginBottom: '1.5rem' }}>
            Reviews ({reviews.length})
          </h3>
          {reviews.length === 0 ? (
            <p style={{ color: '#999', textAlign: 'center', padding: '2rem 0' }}>No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map(r => <ReviewCard key={r._id} review={r} />)
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBooking && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem',
        }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', maxWidth: 440, width: '100%' }}>
            <h4 style={{ fontWeight: 800, marginBottom: '0.3rem' }}>Book Service</h4>
            <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{service.title} — {formatPrice(service.price)}</p>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Select Date</label>
            <input
              type="date" min={minDateStr} value={bookingDate}
              onChange={e => setBookingDate(e.target.value)}
              style={{ width: '100%', padding: '0.7rem', border: '1px solid #ddd', borderRadius: 8, marginBottom: '1.5rem' }}
            />
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button
                onClick={handleBook} disabled={booking}
                style={{
                  flex: 1, padding: '0.8rem', background: '#e91e8c', color: '#fff',
                  border: 'none', borderRadius: 25, fontWeight: 700, cursor: 'pointer',
                }}
              >
                {booking ? 'Booking...' : 'Confirm Booking'}
              </button>
              <button
                onClick={() => setShowBooking(false)}
                style={{
                  flex: 1, padding: '0.8rem', border: '2px solid #ddd', color: '#555',
                  borderRadius: 25, fontWeight: 700, cursor: 'pointer', background: '#fff',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReview && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem',
        }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', maxWidth: 480, width: '100%' }}>
            <h4 style={{ fontWeight: 800, marginBottom: '1.5rem' }}>Write a Review</h4>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Select Booking</label>
            <select
              value={selectedBookingId} onChange={e => setSelectedBookingId(e.target.value)}
              style={{ width: '100%', padding: '0.7rem', border: '1px solid #ddd', borderRadius: 8, marginBottom: '1rem' }}
            >
              <option value="">-- Select a completed booking --</option>
              {reviewableBookings.map(b => (
                <option key={b._id} value={b._id}>{formatDate(b.booking_date)} — {b.service?.title}</option>
              ))}
            </select>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Your Rating</label>
            <div style={{ marginBottom: '1rem' }}>
              <StarRating rating={reviewRating} interactive onRate={setReviewRating} size="2rem" />
            </div>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>Comment (optional)</label>
            <textarea
              value={reviewComment} onChange={e => setReviewComment(e.target.value)}
              rows={3} placeholder="Share your experience..."
              style={{ width: '100%', padding: '0.7rem', border: '1px solid #ddd', borderRadius: 8, marginBottom: '1.5rem', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button
                onClick={handleReview} disabled={submittingReview}
                style={{
                  flex: 1, padding: '0.8rem', background: '#e91e8c', color: '#fff',
                  border: 'none', borderRadius: 25, fontWeight: 700, cursor: 'pointer',
                }}
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                onClick={() => setShowReview(false)}
                style={{
                  flex: 1, padding: '0.8rem', border: '2px solid #ddd', color: '#555',
                  borderRadius: 25, fontWeight: 700, cursor: 'pointer', background: '#fff',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
