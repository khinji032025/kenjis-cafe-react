import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import AdminSidebar from '../../components/AdminSidebar'
import axios from 'axios'
import { API_BASE, IMG_BASE } from "../../config";

const ALL_STATUSES = ['Pending','Received','Preparing','Ready for Pickup','Out for Delivery','Completed','Cancelled']
const STATUS_STYLE = {
  Pending: { bg: '#FEF3E2', color: '#8B5E3C' },
  Received: { bg: '#EBF8FF', color: '#2C7A9B' },
  Preparing: { bg: '#FFFBEB', color: '#B45309' },
  'Ready for Pickup': { bg: '#F0FDF4', color: '#166534' },
  'Out for Delivery': { bg: '#F5F3FF', color: '#6D28D9' },
  Completed: { bg: '#F0FDF4', color: '#14532D' },
  Cancelled: { bg: '#FEF2F2', color: '#991B1B' }
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [viewOrder, setViewOrder] = useState(null)
  const [viewItems, setViewItems] = useState([])
  const [searchParams] = useSearchParams()

  useEffect(() => {
    fetchOrders()
    const viewId = searchParams.get('view')
    if (viewId) fetchOrderDetail(viewId)
  }, [filterStatus])

  function fetchOrders() {
    setLoading(true)
    const params = filterStatus !== 'all' ? `?status=${filterStatus}` : ''
    axios.get(`${API_BASE}/admin_orders.php${params}`)
      .then(res => setOrders(res.data.orders || []))
      .finally(() => setLoading(false))
  }

  function fetchOrderDetail(orderId) {
    axios.get(`${API_BASE}/track_order.php?id=${orderId}`)
      .then(res => {
        if (res.data.success) {
          setViewOrder(res.data.order)
          setViewItems(res.data.items)
        }
      })
  }

  const tdStyle = { padding: '14px 18px', fontSize: '0.88rem', color: '#1E1209', borderBottom: '1px solid rgba(232,217,200,0.5)', verticalAlign: 'middle' }
  const thStyle = { padding: '13px 18px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#8C7B6E', textTransform: 'uppercase', letterSpacing: '0.06em', background: '#FAF6F0', borderBottom: '1px solid #E8D9C8' }

  return (
    <div style={{ display: 'flex', fontFamily: 'DM Sans, sans-serif' }}>
      <AdminSidebar />
      <div style={{ marginLeft: 260, flex: 1, minHeight: '100vh', background: '#F4EDE4' }}>
        <div style={{ background: 'white', borderBottom: '1px solid #E8D9C8', padding: '0 28px', height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 8px rgba(44,24,16,0.08)' }}>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: '#2C1810', fontWeight: 600 }}>
            {viewOrder ? 'Order Details' : 'Orders Management'}
          </span>
          {viewOrder && (
            <button onClick={() => setViewOrder(null)} style={{ padding: '7px 16px', borderRadius: 50, border: '1.5px solid #E8D9C8', background: 'transparent', color: '#2C1810', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>← Back to Orders</button>
          )}
        </div>

        <div style={{ padding: 28 }}>
          {viewOrder ? (
            // Order Detail View
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
              <div style={{ background: 'white', border: '1px solid #E8D9C8', borderRadius: 12, padding: 28, boxShadow: '0 2px 8px rgba(44,24,16,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8C7B6E', marginBottom: 4 }}>Order ID</div>
                    <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: '#2C1810', fontWeight: 700 }}>{viewOrder.order_id}</div>
                  </div>
                  <span style={{ padding: '8px 18px', borderRadius: 50, fontSize: '0.9rem', fontWeight: 600, background: STATUS_STYLE[viewOrder.status]?.bg, color: STATUS_STYLE[viewOrder.status]?.color }}>{viewOrder.status}</span>
                </div>

                {/* Status Display Only */}
                <div style={{ marginBottom: 24, padding: 16, background: '#FAF6F0', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4A3728', marginBottom: 8 }}>Order Status</div>
                  <span style={{ padding: '6px 16px', borderRadius: 50, fontSize: '0.85rem', fontWeight: 600, background: STATUS_STYLE[viewOrder.status]?.bg, color: STATUS_STYLE[viewOrder.status]?.color }}>{viewOrder.status}</span>
                  <div style={{ marginTop: 10, fontSize: '0.78rem', color: '#8C7B6E' }}>⚠️ Only staff can update the order status.</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[['Customer', viewOrder.customer_name], ['Contact', viewOrder.contact_number], ['Delivery', viewOrder.delivery_type], ['Payment', viewOrder.payment_method?.toUpperCase()]].map(([label, val]) => (
                    <div key={label}>
                      <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#8C7B6E', marginBottom: 3 }}>{label}</div>
                      <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{val}</div>
                    </div>
                  ))}
                  {viewOrder.address && <div style={{ gridColumn: '1/-1' }}><div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#8C7B6E', marginBottom: 3 }}>Address</div><div>{viewOrder.address}</div></div>}
                  {viewOrder.special_request && <div style={{ gridColumn: '1/-1' }}><div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#8C7B6E', marginBottom: 3 }}>Special Request</div><div style={{ fontStyle: 'italic', color: '#4A3728' }}>"{viewOrder.special_request}"</div></div>}
                  <div><div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#8C7B6E', marginBottom: 3 }}>Order Date</div><div style={{ fontSize: '0.85rem' }}>{new Date(viewOrder.created_at).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div></div>
                </div>
              </div>

              {/* Items */}
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
                <div style={{ marginTop: 14 }}>
                  {viewOrder.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#7A8C6E', marginBottom: 6 }}><span>Discount</span><span>-₱{Number(viewOrder.discount).toFixed(2)}</span></div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 700, color: '#2C1810', borderTop: '1px solid #E8D9C8', paddingTop: 10 }}>
                    <span>Total</span><span>₱{Number(viewOrder.total_amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Orders List
            <>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                {['all', ...ALL_STATUSES].map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    style={{ padding: '7px 14px', borderRadius: 50, border: '1.5px solid', borderColor: filterStatus === s ? '#2C1810' : '#E8D9C8', background: filterStatus === s ? '#2C1810' : 'transparent', color: filterStatus === s ? '#FAF6F0' : '#4A3728', fontFamily: 'DM Sans, sans-serif', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                    {s === 'all' ? 'All' : s}
                  </button>
                ))}
              </div>

              <div style={{ background: 'white', border: '1px solid #E8D9C8', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(44,24,16,0.08)' }}>
                <div style={{ padding: '18px 24px', borderBottom: '1px solid #E8D9C8' }}>
                  <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.05rem', color: '#2C1810', fontWeight: 600 }}>Orders ({orders.length})</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>{['Order ID', 'Customer', 'Contact', 'Total', 'Payment', 'Type', 'Status', 'Date', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {loading ? <tr><td colSpan={9} style={{ ...tdStyle, textAlign: 'center', padding: 40, color: '#8C7B6E' }}>Loading...</td></tr>
                        : orders.length === 0 ? <tr><td colSpan={9} style={{ ...tdStyle, textAlign: 'center', padding: 40, color: '#8C7B6E' }}>No orders found</td></tr>
                          : orders.map(ord => (
                            <tr key={ord.order_id}>
                              <td style={{ ...tdStyle, fontFamily: 'monospace', color: '#C8854A', fontWeight: 600, fontSize: '0.82rem' }}>{ord.order_id}</td>
                              <td style={{ ...tdStyle, fontWeight: 600 }}>{ord.customer_name}</td>
                              <td style={{ ...tdStyle, fontSize: '0.83rem' }}>{ord.contact_number}</td>
                              <td style={{ ...tdStyle, fontWeight: 700 }}>₱{Number(ord.total_amount).toFixed(2)}</td>
                              <td style={{ ...tdStyle, textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700 }}>{ord.payment_method}</td>
                              <td style={{ ...tdStyle, fontSize: '0.83rem', textTransform: 'capitalize' }}>{ord.delivery_type}</td>
                              <td style={tdStyle}>
                                <span style={{ padding: '4px 12px', borderRadius: 50, fontSize: '0.78rem', fontWeight: 600, background: STATUS_STYLE[ord.status]?.bg, color: STATUS_STYLE[ord.status]?.color }}>{ord.status}</span>
                              </td>
                              <td style={{ ...tdStyle, fontSize: '0.8rem', color: '#8C7B6E' }}>{new Date(ord.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                              <td style={tdStyle}>
                                <button onClick={() => fetchOrderDetail(ord.order_id)} style={{ padding: '5px 12px', borderRadius: 50, border: '1.5px solid #E8D9C8', background: 'transparent', color: '#2C1810', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>View</button>
                              </td>
                            </tr>
                          ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}