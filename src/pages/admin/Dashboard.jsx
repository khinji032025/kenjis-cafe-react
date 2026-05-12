import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminSidebar from '../../components/AdminSidebar'
import axios from 'axios'
import { API_BASE, IMG_BASE } from "../../config";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, pending: 0, staff: 0, revenue: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${API_BASE}/admin?endpoint=stats`)
      .then(res => {
        setStats(res.data.stats)
        setRecentOrders(res.data.recent_orders)
      })
      .finally(() => setLoading(false))
  }, [])

  const STATUS_CLASS = {
    Pending: { bg: '#EBF8FF', color: '#2C7A9B' },
    Received: { bg: '#EBF8FF', color: '#2C7A9B' },
    Preparing: { bg: '#FFFBEB', color: '#B45309' },
    'Ready for Pickup': { bg: '#F0FDF4', color: '#166534' },
    'Out for Delivery': { bg: '#F5F3FF', color: '#6D28D9' },
    Completed: { bg: '#F0FDF4', color: '#14532D' },
    Cancelled: { bg: '#FEF2F2', color: '#991B1B' }
  }

  const statCards = [
    { icon: '☕', label: 'Total Products', value: stats.products, bg: 'rgba(44,24,16,0.08)' },
    { icon: '📋', label: 'Total Orders', value: stats.orders, bg: 'rgba(200,133,74,0.12)' },
    { icon: '⏳', label: 'Pending Orders', value: stats.pending, bg: 'rgba(229,62,62,0.1)' },
    { icon: '👥', label: 'Staff Members', value: stats.staff, bg: 'rgba(122,140,110,0.12)' },
    { icon: '💰', label: 'Total Revenue', value: `₱${Number(stats.revenue || 0).toLocaleString()}`, bg: 'rgba(212,168,83,0.15)' },
  ]

  return (
    <div style={{ display: 'flex', fontFamily: 'DM Sans, sans-serif' }}>
      <AdminSidebar />
      <div style={{ marginLeft: 260, flex: 1, minHeight: '100vh', background: '#F4EDE4' }}>
        {/* Topbar */}
        <div style={{ background: 'white', borderBottom: '1px solid #E8D9C8', padding: '0 28px', height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 8px rgba(44,24,16,0.08)' }}>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: '#2C1810', fontWeight: 600 }}>Dashboard</span>
          <span style={{ fontSize: '0.82rem', color: '#8C7B6E' }}>Welcome, {JSON.parse(localStorage.getItem('cafe_user') || '{}').name} 👋</span>
        </div>

        <div style={{ padding: 28 }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20, marginBottom: 32 }}>
            {statCards.map((s, i) => (
              <div key={i} style={{ background: 'white', border: '1px solid #E8D9C8', borderRadius: 12, padding: 22, boxShadow: '0 2px 8px rgba(44,24,16,0.08)', transition: 'all 0.2s' }}>
                <div style={{ width: 46, height: 46, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: 10 }}>{s.icon}</div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', color: '#2C1810', fontWeight: 700, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '0.8rem', color: '#8C7B6E', fontWeight: 500, marginTop: 6 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Recent Orders */}
          <div style={{ background: 'white', border: '1px solid #E8D9C8', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(44,24,16,0.08)' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E8D9C8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.05rem', color: '#2C1810', fontWeight: 600 }}>Recent Orders</span>
              <Link to="/admin/orders" style={{ padding: '7px 16px', borderRadius: 50, border: '1.5px solid #E8D9C8', background: 'transparent', color: '#2C1810', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', cursor: 'pointer' }}>View All</Link>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Order ID', 'Customer', 'Total', 'Payment', 'Type', 'Status', 'Date', 'Action'].map(h => (
                      <th key={h} style={{ padding: '13px 18px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#8C7B6E', textTransform: 'uppercase', letterSpacing: '0.06em', background: '#FAF6F0', borderBottom: '1px solid #E8D9C8' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#8C7B6E' }}>Loading...</td></tr>
                  ) : recentOrders.length === 0 ? (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#8C7B6E' }}>No orders yet</td></tr>
                  ) : recentOrders.map(ord => (
                    <tr key={ord.order_id} style={{ borderBottom: '1px solid rgba(232,217,200,0.5)' }}>
                      <td style={{ padding: '14px 18px', fontFamily: 'monospace', color: '#C8854A', fontSize: '0.82rem', fontWeight: 600 }}>{ord.order_id}</td>
                      <td style={{ padding: '14px 18px', fontSize: '0.88rem', fontWeight: 600 }}>{ord.customer_name}</td>
                      <td style={{ padding: '14px 18px', fontWeight: 700 }}>₱{Number(ord.total_amount).toFixed(2)}</td>
                      <td style={{ padding: '14px 18px', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>{ord.payment_method}</td>
                      <td style={{ padding: '14px 18px', fontSize: '0.83rem' }}>{ord.delivery_type}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ padding: '4px 12px', borderRadius: 50, fontSize: '0.78rem', fontWeight: 600, background: STATUS_CLASS[ord.status]?.bg || '#F5F5F5', color: STATUS_CLASS[ord.status]?.color || '#333' }}>{ord.status}</span>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: '#8C7B6E' }}>{new Date(ord.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <Link to={`/admin/orders?view=${ord.order_id}`} style={{ padding: '5px 12px', borderRadius: 50, border: '1.5px solid #E8D9C8', background: 'transparent', color: '#2C1810', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none', cursor: 'pointer' }}>View</Link>
                      </td>
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