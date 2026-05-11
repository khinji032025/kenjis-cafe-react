import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/AdminSidebar'
import axios from 'axios'
import { API_BASE } from "../../config";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function AdminReports() {
  const [data, setData] = useState({ daily: [], weekly: [], monthly: [], top_products: [], stats: {} })
  const [period, setPeriod] = useState('daily')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${API_BASE}/admin_reports.php`)
      .then(res => setData(res.data))
      .finally(() => setLoading(false))
  }, [])

  const chartData = data[period] || []

  const statCards = [
    { icon: '💰', label: 'Total Revenue', value: `₱${Number(data.stats?.total_revenue || 0).toLocaleString()}`, bg: 'rgba(212,168,83,0.15)' },
    { icon: '📋', label: 'Total Orders', value: data.stats?.total_orders || 0, bg: 'rgba(200,133,74,0.12)' },
    { icon: '📅', label: "Today's Revenue", value: `₱${Number(data.stats?.today_revenue || 0).toLocaleString()}`, bg: 'rgba(44,24,16,0.08)' },
    { icon: '🛒', label: "Today's Orders", value: data.stats?.today_orders || 0, bg: 'rgba(122,140,110,0.12)' },
  ]

  return (
    <div style={{ display: 'flex', fontFamily: 'DM Sans, sans-serif' }}>
      <AdminSidebar />
      <div style={{ marginLeft: 260, flex: 1, minHeight: '100vh', background: '#F4EDE4' }}>
        <div style={{ background: 'white', borderBottom: '1px solid #E8D9C8', padding: '0 28px', height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 8px rgba(44,24,16,0.08)' }}>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: '#2C1810', fontWeight: 600 }}>Sales Report</span>
          <span style={{ fontSize: '0.82rem', color: '#8C7B6E' }}>Last updated: {new Date().toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        <div style={{ padding: 28 }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 20, marginBottom: 28 }}>
            {statCards.map((s, i) => (
              <div key={i} style={{ background: 'white', border: '1px solid #E8D9C8', borderRadius: 12, padding: 22, boxShadow: '0 2px 8px rgba(44,24,16,0.08)' }}>
                <div style={{ width: 46, height: 46, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: 10 }}>{s.icon}</div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: '#2C1810', fontWeight: 700, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '0.8rem', color: '#8C7B6E', marginTop: 6 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Revenue Chart */}
          <div style={{ background: 'white', border: '1px solid #E8D9C8', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(44,24,16,0.08)', marginBottom: 28 }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E8D9C8', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.05rem', color: '#2C1810', fontWeight: 600 }}>Revenue Chart</span>
              <div style={{ display: 'flex', gap: 8 }}>
                {['daily', 'weekly', 'monthly'].map(p => (
                  <button key={p} onClick={() => setPeriod(p)}
                    style={{ padding: '7px 16px', borderRadius: 50, border: '1.5px solid', borderColor: period === p ? '#2C1810' : '#E8D9C8', background: period === p ? '#2C1810' : 'transparent', color: period === p ? '#FAF6F0' : '#4A3728', fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ padding: 24 }}>
              {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#8C7B6E' }}>Loading chart...</div> : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8D9C8" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8C7B6E' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#8C7B6E' }} tickFormatter={v => `₱${v.toLocaleString()}`} />
                    <Tooltip formatter={v => [`₱${Number(v).toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#C8854A" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Orders Chart */}
            <div style={{ background: 'white', border: '1px solid #E8D9C8', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(44,24,16,0.08)' }}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid #E8D9C8' }}>
                <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.05rem', color: '#2C1810', fontWeight: 600 }}>Orders Count</span>
              </div>
              <div style={{ padding: 24 }}>
                {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#8C7B6E' }}>Loading...</div> : (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8D9C8" />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8C7B6E' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#8C7B6E' }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="orders" stroke="#2C1810" strokeWidth={2} dot={{ fill: '#2C1810', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Top Products */}
            <div style={{ background: 'white', border: '1px solid #E8D9C8', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(44,24,16,0.08)' }}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid #E8D9C8' }}>
                <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.05rem', color: '#2C1810', fontWeight: 600 }}>🏆 Top 5 Products</span>
              </div>
              <div style={{ padding: 20 }}>
                {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#8C7B6E' }}>Loading...</div>
                  : data.top_products?.length === 0 ? <div style={{ textAlign: 'center', padding: 32, color: '#8C7B6E', fontSize: '0.88rem' }}>No sales data yet</div>
                    : data.top_products?.map((p, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(232,217,200,0.4)' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#2C1810', color: '#D4A853', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#2C1810' }}>{p.product_name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#8C7B6E' }}>{p.total_qty} sold</div>
                        </div>
                        <div style={{ fontWeight: 700, color: '#C8854A', fontSize: '0.9rem' }}>₱{Number(p.total_revenue).toLocaleString()}</div>
                      </div>
                    ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}