import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/AdminSidebar'
import axios from 'axios'
import { API_BASE } from "../../config";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState({ avg: 0, total: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${API_BASE}/admin?endpoint=reviews`)
  .then(res => {
    setReviews(res.data.reviews || [])
    setStats({ avg: res.data.avg_rating || 0, total: res.data.total || 0 })
  })
      .finally(() => setLoading(false))
  }, [])

  const tdStyle = { padding: '14px 18px', fontSize: '0.88rem', color: '#1E1209', borderBottom: '1px solid rgba(232,217,200,0.5)', verticalAlign: 'middle' }
  const thStyle = { padding: '13px 18px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#8C7B6E', textTransform: 'uppercase', letterSpacing: '0.06em', background: '#FAF6F0', borderBottom: '1px solid #E8D9C8' }

  return (
    <div style={{ display: 'flex', fontFamily: 'DM Sans, sans-serif' }}>
      <AdminSidebar />
      <div style={{ marginLeft: 260, flex: 1, minHeight: '100vh', background: '#F4EDE4' }}>
        <div style={{ background: 'white', borderBottom: '1px solid #E8D9C8', padding: '0 28px', height: 66, display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 8px rgba(44,24,16,0.08)' }}>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: '#2C1810', fontWeight: 600 }}>Customer Reviews</span>
        </div>

        <div style={{ padding: 28 }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 20, marginBottom: 28 }}>
            <div style={{ background: 'white', border: '1px solid #E8D9C8', borderRadius: 12, padding: 22, boxShadow: '0 2px 8px rgba(44,24,16,0.08)' }}>
              <div style={{ width: 46, height: 46, borderRadius: 10, background: 'rgba(212,168,83,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: 10 }}>⭐</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', color: '#2C1810', fontWeight: 700 }}>{Number(stats.avg || 0).toFixed(1)}</div>
              <div style={{ fontSize: '0.8rem', color: '#8C7B6E', marginTop: 6 }}>Average Rating</div>
            </div>
            <div style={{ background: 'white', border: '1px solid #E8D9C8', borderRadius: 12, padding: 22, boxShadow: '0 2px 8px rgba(44,24,16,0.08)' }}>
              <div style={{ width: 46, height: 46, borderRadius: 10, background: 'rgba(200,133,74,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: 10 }}>💬</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', color: '#2C1810', fontWeight: 700 }}>{stats.total || 0}</div>
              <div style={{ fontSize: '0.8rem', color: '#8C7B6E', marginTop: 6 }}>Total Reviews</div>
            </div>
          </div>

          <div style={{ background: 'white', border: '1px solid #E8D9C8', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(44,24,16,0.08)' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E8D9C8' }}>
              <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.05rem', color: '#2C1810', fontWeight: 600 }}>All Reviews</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>{['Customer', 'Order ID', 'Rating', 'Comment', 'Date'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {loading ? <tr><td colSpan={5} style={{ ...tdStyle, textAlign: 'center', padding: 40, color: '#8C7B6E' }}>Loading...</td></tr>
                    : reviews.length === 0 ? <tr><td colSpan={5} style={{ ...tdStyle, textAlign: 'center', padding: 40, color: '#8C7B6E' }}>No reviews yet</td></tr>
                      : reviews.map(r => (
                        <tr key={r.id}>
                          <td style={{ ...tdStyle, fontWeight: 600 }}>{r.customer_name}</td>
                          <td style={{ ...tdStyle, fontFamily: 'monospace', color: '#C8854A', fontSize: '0.82rem' }}>{r.order_id}</td>
                          <td style={tdStyle}>
                            <div style={{ display: 'flex', gap: 2 }}>
                              {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= r.rating ? '#D4A853' : '#ddd', fontSize: '1rem' }}>★</span>)}
                            </div>
                          </td>
                          <td style={{ ...tdStyle, fontStyle: 'italic', color: '#4A3728', maxWidth: 300 }}>
                            {r.comment ? `"${r.comment}"` : <span style={{ color: '#8C7B6E' }}>No comment</span>}
                          </td>
                          <td style={{ ...tdStyle, fontSize: '0.78rem', color: '#8C7B6E' }}>{new Date(r.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}