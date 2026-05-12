import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { API_BASE, IMG_BASE } from '../config'


const STATUS_STEPS = ['Pending', 'Received', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Completed']
const STATUS_ICONS = { Pending: '⏳', Received: '📋', Preparing: '👨‍🍳', 'Ready for Pickup': '✅', 'Out for Delivery': '🚚', Completed: '🎉', Cancelled: '❌' }
const STATUS_COLORS = { Pending: '#8B5E3C', Received: '#2C7A9B', Preparing: '#B45309', 'Ready for Pickup': '#166534', 'Out for Delivery': '#6D28D9', Completed: '#14532D', Cancelled: '#991B1B' }

function ReviewSection({ orderId }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [existing, setExisting] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    axios.get(`${API_BASE}/reviews?endpoint=check&order_id=${orderId}`)
      .then(res => {
        if (res.data.exists) setExisting(res.data.review)
      })
      .finally(() => setLoading(false))
  }, [orderId])

  async function submitReview() {
    if (rating === 0) { alert('Please select a star rating!'); return }
    setSubmitting(true)
    try {
      const res = await axios.post(`${API_BASE}/reviews?endpoint=submit`, { order_id: orderId, rating, comment })
      if (res.data.success) setSubmitted(true)
else alert(res.data.message || 'Failed to submit review.')
    } catch (err) {
    alert(err.response?.data?.message || 'Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return null

  return (
    <div style={{ padding: '20px 28px', borderTop: '1px solid #E8D9C8' }}>
      {existing || submitted ? (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>⭐</div>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: '#2C1810', marginBottom: 8 }}>Your Review</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 8 }}>
            {[1,2,3,4,5].map(i => (
              <span key={i} style={{ fontSize: '1.5rem', color: i <= (existing?.rating || rating) ? '#D4A853' : '#ddd' }}>★</span>
            ))}
          </div>
          {(existing?.comment || comment) && (
            <p style={{ color: '#4A3728', fontStyle: 'italic', fontSize: '0.88rem' }}>"{existing?.comment || comment}"</p>
          )}
        </div>
      ) : (
        <div>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: '#2C1810', marginBottom: 4 }}>How was your order?</div>
            <div style={{ fontSize: '0.82rem', color: '#8C7B6E' }}>Leave a rating and help us improve!</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
            {[1,2,3,4,5].map(i => (
              <button key={i}
                onClick={() => setRating(i)}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(0)}
                style={{ fontSize: '2rem', background: 'none', border: 'none', cursor: 'pointer', color: i <= (hover || rating) ? '#D4A853' : '#ddd', transform: i <= (hover || rating) ? 'scale(1.2)' : 'scale(1)', transition: 'all 0.15s' }}>
                ★
              </button>
            ))}
          </div>
          <div style={{ marginBottom: 16 }}>
            <textarea value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Share your experience (optional)..."
              rows={3}
              style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #E8D9C8', borderRadius: 8, fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>
          <button onClick={submitReview} disabled={submitting}
            style={{ width: '100%', padding: 14, background: '#2C1810', color: '#FAF6F0', border: 'none', borderRadius: 50, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}>
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function Track() {
  const [searchParams] = useSearchParams()
  const [orderId, setOrderId] = useState(searchParams.get('id') || '')
  const [order, setOrder] = useState(null)
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (searchParams.get('id')) handleTrack(null, searchParams.get('id'))
  }, [])

  async function handleTrack(e, id) {
    if (e) e.preventDefault()
    const trackId = id || orderId
    if (!trackId) return
    setLoading(true)
    setError('')
    setOrder(null)
    try {
      const res = await axios.get(`${API_BASE}/track_order?id=${trackId}`)
      if (res.data.success) {
        setOrder(res.data.order)
        setItems(res.data.items)
      } else {
        setError(res.data.message)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const currentIdx = order ? STATUS_STEPS.indexOf(order.status) : -1

  return (
    <div>
      <Navbar />
      <div style={{ paddingTop: 72 }}>
        <div className="bg-coffee-dark py-20 px-8 text-center">
          <span className="text-xs font-semibold tracking-widest uppercase text-gold block mb-3">Real-Time Updates</span>
          <h1 className="font-playfair text-white text-5xl font-bold">Track Your Order</h1>
          <p className="text-white/60 mt-3">Enter your Order ID to see the current status</p>
        </div>

        <div className="max-w-2xl mx-auto px-8 py-16">
          {/* Search */}
          <div className="bg-warm-white border border-[#E8D9C8] rounded-2xl p-9 mb-10 shadow-sm">
            <h3 className="font-playfair text-coffee-dark text-xl mb-5">Enter Order ID</h3>
            <form onSubmit={handleTrack} className="flex gap-3">
              <input type="text" value={orderId} onChange={e => setOrderId(e.target.value.toUpperCase())}
                placeholder="e.g. KJC-ABC12345"
                className="flex-1 px-5 py-3 border border-[#E8D9C8] rounded-full text-sm bg-white outline-none focus:border-caramel transition-all uppercase tracking-wider"
                required
              />
              <button type="submit" className="bg-coffee-dark text-cream px-7 py-3 rounded-full font-semibold text-sm hover:bg-caramel transition-all cursor-pointer border-none whitespace-nowrap">
                {loading ? '...' : 'Track →'}
              </button>
            </form>
            {error && <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">❌ {error}</div>}
          </div>

          {order && (
            <div className="bg-warm-white border border-[#E8D9C8] rounded-2xl overflow-hidden shadow-md">
              {/* Header */}
              <div className="bg-coffee-dark px-7 py-6 flex justify-between items-center flex-wrap gap-3">
                <div>
                  <div className="text-white/50 text-xs uppercase tracking-widest mb-1">Order ID</div>
                  <div className="font-playfair text-white text-2xl font-bold tracking-wide">{order.order_id}</div>
                </div>
                <span className="px-5 py-2 rounded-full text-sm font-semibold" style={{ background: 'rgba(255,255,255,0.1)', color: STATUS_COLORS[order.status] || 'white' }}>
                  {STATUS_ICONS[order.status]} {order.status}
                </span>
              </div>

              {/* Progress */}
              {order.status !== 'Cancelled' && (
  <div className="px-7 pt-7 pb-2">
    <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: 20 }}>
      <div style={{ position: 'absolute', top: 16, left: 0, right: 0, height: 3, background: '#E8D9C8', zIndex: 0 }} />
      {STATUS_STEPS.map((step, idx) => (
        <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative', zIndex: 1, flex: 1 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.85rem', fontWeight: 'bold',
            background: idx <= currentIdx ? '#C8854A' : 'white',
            border: `2px solid ${idx <= currentIdx ? '#C8854A' : '#E8D9C8'}`,
            color: idx <= currentIdx ? 'white' : '#8C7B6E'
          }}>
            {idx <= currentIdx ? '✓' : idx + 1}
          </div>
          <span style={{
            fontSize: '0.68rem', fontWeight: 600, textAlign: 'center',
            lineHeight: 1.2, maxWidth: 70,
            color: idx <= currentIdx ? '#C8854A' : '#8C7B6E'
          }}>{step}</span>
        </div>
      ))}
    </div>
  </div>
)}

              {/* Details */}
              <div className="px-7 py-5 grid grid-cols-2 gap-4 border-t border-[#E8D9C8]">
                {[['Customer', order.customer_name], ['Contact', order.contact_number], ['Delivery', order.delivery_type], ['Payment', order.payment_method.toUpperCase()]].map(([label, val]) => (
                  <div key={label}>
                    <div className="text-xs uppercase tracking-wider text-[#8C7B6E] mb-1">{label}</div>
                    <div className="font-semibold text-coffee-dark capitalize">{val}</div>
                  </div>
                ))}
                {order.address && <div className="col-span-2"><div className="text-xs uppercase tracking-wider text-[#8C7B6E] mb-1">Address</div><div className="text-coffee-dark">{order.address}</div></div>}
              </div>

              {/* Items */}
              <div className="px-7 py-5 border-t border-[#E8D9C8]">
                <div className="text-xs font-bold uppercase tracking-wider text-[#8C7B6E] mb-4">Items Ordered</div>
                {items.map((item, i) => (
                  <div key={i} className="flex justify-between py-2.5 border-b border-[#E8D9C8]/50 last:border-0">
                    <div>
                      <div className="font-semibold text-sm text-coffee-dark">{item.product_name}</div>
                      <div className="text-xs text-[#8C7B6E]">₱{Number(item.price).toFixed(2)} × {item.quantity}</div>
                    </div>
                    <div className="font-bold text-caramel">₱{Number(item.subtotal).toFixed(2)}</div>
                  </div>
                ))}
                <div className="mt-4 flex justify-end">
                  <div className="font-playfair text-xl font-bold text-coffee-dark">Total: ₱{Number(order.total_amount).toFixed(2)}</div>
                </div>
              </div>
              {/* Review Section */}
{order.status === 'Completed' && (
  <ReviewSection orderId={order.order_id} />
)}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}