import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_BASE } from "../../config";

const ALL_STATUSES = ['Pending','Received','Preparing','Ready for Pickup','Out for Delivery','Completed','Cancelled']
function getAvailableStatuses(currentStatus) {
  if (currentStatus === 'Completed' || currentStatus === 'Cancelled') {
    return [currentStatus]
  }
  const idx = ALL_STATUSES.indexOf(currentStatus)
  const forward = ALL_STATUSES.slice(idx, ALL_STATUSES.length - 1) // exclude Cancelled from forward
  return [...forward, 'Cancelled'] // Cancelled always available as last option
}
const STATUS_STYLE = {
  Pending: { bg: '#FEF3E2', color: '#8B5E3C' },
  Received: { bg: '#EBF8FF', color: '#2C7A9B' },
  Preparing: { bg: '#FFFBEB', color: '#B45309' },
  'Ready for Pickup': { bg: '#F0FDF4', color: '#166534' },
  'Out for Delivery': { bg: '#F5F3FF', color: '#6D28D9' },
  Completed: { bg: '#F0FDF4', color: '#14532D' },
  Cancelled: { bg: '#FEF2F2', color: '#991B1B' }
}

export default function StaffDashboard() {
  const [orders, setOrders] = useState([])
  const [filterStatus, setFilterStatus] = useState('active')
  const [viewOrder, setViewOrder] = useState(null)
  const [viewItems, setViewItems] = useState([])
  const [stats, setStats] = useState({ active: 0, today: 0, completed: 0, pending: 0 })
  const [notifications, setNotifications] = useState(() => JSON.parse(localStorage.getItem('staff_notifications') || '[]'))
  const [notifOpen, setNotifOpen] = useState(false)
  const [toast, setToast] = useState({ show: false, msg: '', type: '' })
  const [updatingStatus, setUpdatingStatus] = useState('')
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('cafe_user') || '{}')
  const notifRef = useRef(null)

  useEffect(() => {
    fetchOrders()
    fetchStats()
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission()
    const interval = setInterval(checkNewOrders, 15000)
    return () => clearInterval(interval)
  }, [filterStatus])

  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function fetchOrders() {
    let url = `${API_BASE}/staff_orders.php`
    if (filterStatus === 'active') url += '?filter=active'
    else if (filterStatus !== 'all') url += `?filter=${filterStatus}`
    else url += '?filter=all'
    axios.get(url).then(res => setOrders(res.data.orders || []))
  }

  function fetchStats() {
    axios.get(`${API_BASE}/staff_orders.php?stats=1`).then(res => setStats(res.data.stats || {}))
  }

  function fetchOrderDetail(orderId) {
    axios.get(`${API_BASE}  /track_order.php?id=${orderId}`).then(res => {
      if (res.data.success) { setViewOrder(res.data.order); setViewItems(res.data.items) }
    })
  }

  async function updateStatus(orderId, newStatus) {
    setUpdatingStatus(orderId)
    try {
      await axios.post(`${API_BASE}/staff_update_status.php`, new URLSearchParams({ order_id: orderId, new_status: newStatus }))
      showToast('✓ Status updated!', 'success')
      fetchOrders()
      fetchStats()
      if (viewOrder?.order_id === orderId) fetchOrderDetail(orderId)
    } catch {
      showToast('Failed to update.', 'error')
    } finally {
      setUpdatingStatus('')
    }
  }

  function checkNewOrders() {
    axios.get('/api/check_new_orders.php').then(res => {
      if (res.data.new_orders?.length > 0) {
        let hasNew = false
        const updated = [...notifications]
        res.data.new_orders.forEach(order => {
          if (!updated.find(n => n.order_id === order.order_id)) {
            hasNew = true
            updated.unshift({ order_id: order.order_id, customer_name: order.customer_name, total_amount: order.total_amount, time: new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }) })
          }
        })
        if (hasNew) {
          setNotifications(updated)
          localStorage.setItem('staff_notifications', JSON.stringify(updated))
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification("🛒 New Order - Kenji's Cafe", { body: `${res.data.new_orders[0].customer_name} placed an order` })
          }
          showToast('🛒 New order received!', 'success')
        }
      }
    }).catch(() => {})
  }

  function clearNotifications() {
    setNotifications([])
    localStorage.setItem('staff_notifications', '[]')
  }

  function showToast(msg, type = '') {
    setToast({ show: true, msg, type })
    setTimeout(() => setToast({ show: false, msg: '', type: '' }), 3500)
  }

  function logout() {
    localStorage.removeItem('cafe_user')
    navigate('/login')
  }

  const pendingCount = stats.pending || 0
  const tdStyle = { padding: '12px 16px', fontSize: '0.85rem', color: '#1E1209', borderBottom: '1px solid rgba(232,217,200,0.5)', verticalAlign: 'middle' }
  const thStyle = { padding: '11px 16px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: '#8C7B6E', textTransform: 'uppercase', letterSpacing: '0.06em', background: '#FAF6F0', borderBottom: '1px solid #E8D9C8' }

  return (
    <div style={{ display: 'flex', fontFamily: 'DM Sans, sans-serif', minHeight: '100vh', background: '#F4EDE4' }}>
      {/* Sidebar */}
      <aside style={{ width: 240, minHeight: '100vh', background: '#2C1810', position: 'fixed', top: 0, left: 0, display: 'flex', flexDirection: 'column', zIndex: 100 }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, background: '#D4A853', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Playfair Display, serif', color: '#2C1810', fontSize: '1.15rem', fontWeight: 700 }}>K</div>
          <div>
            <div style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontSize: '1rem' }}>Kenji's Cafe</div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Staff Panel</div>
          </div>
        </div>
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', padding: '12px 10px 6px' }}>Orders</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 8, color: '#D4A853', background: 'rgba(200,133,74,0.2)', borderLeft: '3px solid #D4A853', fontSize: '0.88rem', fontWeight: 500 }}>
            <span>📋</span> Manage Orders
          </div>
          <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', padding: '12px 10px 6px' }}>Site</div>
          <a href="http://sql308.infinityfree.com" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 8, color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontSize: '0.88rem' }}>🌐 View Website</a>
        </nav>
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>👤</div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'white', fontWeight: 600 }}>{user.name}</div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)' }}>Staff</div>
            </div>
          </div>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', width: '100%', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'DM Sans, sans-serif' }}>🚪 Logout</button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ marginLeft: 240, flex: 1 }}>
        {/* Topbar */}
        <div style={{ background: 'white', borderBottom: '1px solid #E8D9C8', padding: '0 28px', height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 8px rgba(44,24,16,0.08)' }}>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: '#2C1810', fontWeight: 600 }}>
            {viewOrder ? 'Order Details' : 'Orders Management'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Bell */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button onClick={() => setNotifOpen(!notifOpen)} style={{ position: 'relative', background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', padding: 4, borderRadius: '50%' }}>
                🔔
                {pendingCount > 0 && <span style={{ position: 'absolute', top: -6, right: -6, background: '#e53e3e', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{pendingCount}</span>}
              </button>
              {notifOpen && (
                <div style={{ position: 'absolute', top: 40, right: 0, width: 300, background: 'white', border: '1px solid #E8D9C8', borderRadius: 12, boxShadow: '0 8px 32px rgba(44,24,16,0.12)', zIndex: 999, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 18px', borderBottom: '1px solid #E8D9C8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#2C1810', fontSize: '0.9rem' }}>🔔 Notifications</span>
                    <button onClick={clearNotifications} style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: '#8C7B6E', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Clear all</button>
                  </div>
                  <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: 32, color: '#8C7B6E', fontSize: '0.85rem' }}>No new notifications</div>
                    ) : notifications.slice(0, 10).map((n, i) => (
                      <div key={i} onClick={() => { fetchOrderDetail(n.order_id); setViewOrder({}); setNotifOpen(false) }}
                        style={{ padding: '12px 18px', borderBottom: '1px solid rgba(232,217,200,0.4)', cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FAF6F0'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#2C1810' }}>🛒 New Order!</div>
                        <div style={{ fontSize: '0.78rem', color: '#4A3728', marginTop: 2 }}>{n.customer_name} — ₱{Number(n.total_amount).toFixed(2)}</div>
                        <div style={{ fontSize: '0.72rem', color: '#8C7B6E', marginTop: 1 }}>Order ID: {n.order_id} · {n.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <span style={{ fontSize: '0.82rem', color: '#8C7B6E' }}>Welcome, {user.name} 👋</span>
          </div>
        </div>

        <div style={{ padding: 28 }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 24 }}>
            {[['⏳', 'Active Orders', stats.active || 0, 'rgba(229,62,62,0.1)'], ['📋', "Today's Orders", stats.today || 0, 'rgba(200,133,74,0.12)'], ['✅', 'Completed', stats.completed || 0, 'rgba(122,140,110,0.12)']].map(([icon, label, val, bg]) => (
              <div key={label} style={{ background: 'white', border: '1px solid #E8D9C8', borderRadius: 12, padding: 22, boxShadow: '0 2px 8px rgba(44,24,16,0.08)' }}>
                <div style={{ width: 46, height: 46, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: 10 }}>{icon}</div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', color: '#2C1810', fontWeight: 700, lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: '0.8rem', color: '#8C7B6E', marginTop: 6 }}>{label}</div>
              </div>
            ))}
          </div>

          {viewOrder && viewOrder.order_id ? (
            // Order Detail
            <div>
              <button onClick={() => setViewOrder(null)} style={{ padding: '7px 16px', borderRadius: 50, border: '1.5px solid #E8D9C8', background: 'transparent', color: '#2C1810', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', marginBottom: 20 }}>← Back to Orders</button>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
                <div style={{ background: 'white', border: '1px solid #E8D9C8', borderRadius: 12, padding: 28, boxShadow: '0 2px 8px rgba(44,24,16,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#8C7B6E', marginBottom: 4 }}>Order ID</div>
                      <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: '#2C1810', fontWeight: 700 }}>{viewOrder.order_id}</div>
                    </div>
                    <span style={{ padding: '8px 18px', borderRadius: 50, fontSize: '0.9rem', fontWeight: 600, background: STATUS_STYLE[viewOrder.status]?.bg, color: STATUS_STYLE[viewOrder.status]?.color }}>{viewOrder.status}</span>
                  </div>

                  {/* Update Status */}
                  <div style={{ marginBottom: 24, padding: 16, background: '#FAF6F0', borderRadius: 8 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4A3728', display: 'block', marginBottom: 8 }}>Update Order Status</label>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <select
  value={viewOrder.status}
  onChange={e => updateStatus(viewOrder.order_id, e.target.value)}
  disabled={viewOrder.status === 'Completed'}
  style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #E8D9C8', borderRadius: 8, fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', outline: 'none', cursor: viewOrder.status === 'Completed' ? 'not-allowed' : 'pointer' }}>
  {getAvailableStatuses(viewOrder.status).map(s => <option key={s} value={s}>{s}</option>)}
</select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {[['Customer', viewOrder.customer_name], ['Contact', viewOrder.contact_number], ['Delivery', viewOrder.delivery_type], ['Payment', viewOrder.payment_method?.toUpperCase()]].map(([label, val]) => (
                      <div key={label}>
                        <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#8C7B6E', marginBottom: 3 }}>{label}</div>
                        <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{val}</div>
                      </div>
                    ))}
                    {viewOrder.address && <div style={{ gridColumn: '1/-1' }}><div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#8C7B6E', marginBottom: 3 }}>Address</div><div>{viewOrder.address}</div></div>}
                    {viewOrder.special_request && <div style={{ gridColumn: '1/-1' }}><div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#8C7B6E', marginBottom: 3 }}>Special Request</div><div style={{ fontStyle: 'italic' }}>"{viewOrder.special_request}"</div></div>}
                  </div>
                </div>

                <div style={{ background: 'white', border: '1px solid #E8D9C8', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(44,24,16,0.08)' }}>
                  <div style={{ fontWeight: 700, color: '#2C1810', marginBottom: 16, fontFamily: 'Playfair Display, serif' }}>Items Ordered</div>
                  {viewItems.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(232,217,200,0.5)' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{item.product_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#8C7B6E' }}>₱{Number(item.price).toFixed(2)} × {item.quantity}</div>
                      </div>
                      <div style={{ fontWeight: 700, color: '#C8854A' }}>₱{Number(item.subtotal).toFixed(2)}</div>
                    </div>
                  ))}
                  <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 700, color: '#2C1810', borderTop: '1px solid #E8D9C8', paddingTop: 10 }}>
                    <span>Total</span><span>₱{Number(viewOrder.total_amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Orders List
            <>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                {[['active', '⏳ Active Orders'], ['all', '📋 All Orders'], ...ALL_STATUSES.map(s => [s, s])].map(([val, label]) => (
                  <button key={val} onClick={() => setFilterStatus(val)}
                    style={{ padding: '7px 14px', borderRadius: 50, border: '1.5px solid', borderColor: filterStatus === val ? '#2C1810' : '#E8D9C8', background: filterStatus === val ? '#2C1810' : 'transparent', color: filterStatus === val ? '#FAF6F0' : '#4A3728', fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                    {label}
                  </button>
                ))}
              </div>

              <div style={{ background: 'white', border: '1px solid #E8D9C8', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(44,24,16,0.08)' }}>
                <div style={{ padding: '18px 24px', borderBottom: '1px solid #E8D9C8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.05rem', color: '#2C1810', fontWeight: 600 }}>Orders ({orders.length})</span>
                  <button onClick={() => { fetchOrders(); fetchStats() }} style={{ padding: '7px 16px', borderRadius: 50, border: '1.5px solid #E8D9C8', background: 'transparent', color: '#2C1810', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>↻ Refresh</button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>{['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Type', 'Status', 'Time', 'Update', 'Details'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 ? (
                        <tr><td colSpan={10} style={{ ...tdStyle, textAlign: 'center', padding: 48, color: '#8C7B6E' }}>
                          <div style={{ fontSize: '2rem', marginBottom: 8 }}>✅</div>No orders in this view
                        </td></tr>
                      ) : orders.map(ord => (
                        <tr key={ord.order_id}>
                          <td style={{ ...tdStyle, fontFamily: 'monospace', color: '#C8854A', fontWeight: 600, fontSize: '0.82rem' }}>{ord.order_id}</td>
                          <td style={tdStyle}>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{ord.customer_name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#8C7B6E' }}>{ord.contact_number}</div>
                          </td>
                          <td style={{ ...tdStyle, fontSize: '0.85rem' }}>{ord.item_count} item{ord.item_count != 1 ? 's' : ''}</td>
                          <td style={{ ...tdStyle, fontWeight: 700 }}>₱{Number(ord.total_amount).toFixed(2)}</td>
                          <td style={{ ...tdStyle, textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700 }}>{ord.payment_method}</td>
                          <td style={{ ...tdStyle, fontSize: '0.82rem', textTransform: 'capitalize' }}>{ord.delivery_type}</td>
                          <td style={tdStyle}>
                            <span style={{ padding: '4px 10px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 600, background: STATUS_STYLE[ord.status]?.bg, color: STATUS_STYLE[ord.status]?.color }}>{ord.status}</span>
                          </td>
                          <td style={{ ...tdStyle, fontSize: '0.75rem', color: '#8C7B6E' }}>
                            {new Date(ord.created_at).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}<br />
                            {new Date(ord.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                          </td>
                          <td style={tdStyle}>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                             <select
  value={ord.status}
  onChange={e => updateStatus(ord.order_id, e.target.value)}
  disabled={updatingStatus === ord.order_id || ord.status === 'Completed'}
  style={{ padding: '5px 10px', border: '1.5px solid #E8D9C8', borderRadius: 6, fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', fontWeight: 600, cursor: ord.status === 'Completed' ? 'not-allowed' : 'pointer', outline: 'none', background: '#FAF6F0', width: 130 }}>
  {getAvailableStatuses(ord.status).map(s => <option key={s} value={s}>{s}</option>)}
</select>
                            </div>
                          </td>
                          <td style={tdStyle}>
                            <button onClick={() => fetchOrderDetail(ord.order_id)} style={{ padding: '5px 12px', borderRadius: 50, border: '1.5px solid #E8D9C8', background: 'transparent', color: '#2C1810', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div style={{ textAlign: 'center', marginTop: 16, fontSize: '0.78rem', color: '#8C7B6E' }}>
                Page auto-refreshes every 60 seconds. <button onClick={() => { fetchOrders(); fetchStats() }} style={{ background: 'none', border: 'none', color: '#C8854A', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>Refresh now</button>
              </div>
            </>
          )}
        </div>
      </div>

      {toast.show && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: toast.type === 'error' ? '#e53e3e' : '#7A8C6E', color: 'white', padding: '13px 22px', borderRadius: 8, fontSize: '0.88rem', zIndex: 9999, boxShadow: '0 8px 32px rgba(44,24,16,0.12)' }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}