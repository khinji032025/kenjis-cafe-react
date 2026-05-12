import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/AdminSidebar'
import axios from 'axios'
import { API_BASE, IMG_BASE } from "../../config";

export default function AdminStaff() {
  const [staffList, setStaffList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editStaff, setEditStaff] = useState(null)
  const [form, setForm] = useState({ name: '', contact: '', username: '', password: '', role: 'staff' })
  const [toast, setToast] = useState({ show: false, msg: '', type: '' })
  const currentUser = JSON.parse(localStorage.getItem('cafe_user') || '{}')

  useEffect(() => { fetchStaff() }, [])

  function fetchStaff() {
    setLoading(true)
    axios.get(`${API_BASE}/admin?endpoint=staff`)
      .then(res => setStaffList(res.data.staff || []))
      .finally(() => setLoading(false))
  }

  function showToast(msg, type = 'success') {
    setToast({ show: true, msg, type })
    setTimeout(() => setToast({ show: false, msg: '', type: '' }), 3000)
  }

  function openEdit(s) {
    setEditStaff(s)
    setForm({ name: s.name, contact: s.contact || '', username: s.username, password: '', role: s.role })
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const data = new URLSearchParams({ ...form, action: editStaff ? 'edit' : 'add' })
    if (editStaff) data.append('id', editStaff.id)
    try {
      const res = await axios.post(`${API_BASE}/admin?endpoint=staff`, data)
      if (res.data.success) {
        showToast(res.data.message)
        setShowModal(false)
        setEditStaff(null)
        setForm({ name: '', contact: '', username: '', password: '', role: 'staff' })
        fetchStaff()
      } else {
        showToast(res.data.message, 'error')
      }
    } catch {
      showToast('Failed. Please try again.', 'error')
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remove this staff member?')) return
    try {
      await axios.post(`${API_BASE}/admin?endpoint=staff`, new URLSearchParams({ action: 'delete', id }))
      showToast('Staff deleted.')
      fetchStaff()
    } catch {
      showToast('Failed.', 'error')
    }
  }

  const tdStyle = { padding: '14px 18px', fontSize: '0.88rem', color: '#1E1209', borderBottom: '1px solid rgba(232,217,200,0.5)', verticalAlign: 'middle' }
  const thStyle = { padding: '13px 18px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#8C7B6E', textTransform: 'uppercase', letterSpacing: '0.06em', background: '#FAF6F0', borderBottom: '1px solid #E8D9C8' }
  const inputStyle = { width: '100%', padding: '11px 14px', border: '1.5px solid #E8D9C8', borderRadius: 8, fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', color: '#1E1209', background: 'white', outline: 'none' }

  return (
    <div style={{ display: 'flex', fontFamily: 'DM Sans, sans-serif' }}>
      <AdminSidebar />
      <div style={{ marginLeft: 260, flex: 1, minHeight: '100vh', background: '#F4EDE4' }}>
        <div style={{ background: 'white', borderBottom: '1px solid #E8D9C8', padding: '0 28px', height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 8px rgba(44,24,16,0.08)' }}>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: '#2C1810', fontWeight: 600 }}>Staff Management</span>
          <button onClick={() => { setEditStaff(null); setForm({ name: '', contact: '', username: '', password: '', role: 'staff' }); setShowModal(true) }}
            style={{ padding: '9px 20px', background: '#2C1810', color: '#FAF6F0', border: 'none', borderRadius: 50, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
            + Add Staff
          </button>
        </div>

        <div style={{ padding: 28 }}>
          <div style={{ background: 'white', border: '1px solid #E8D9C8', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(44,24,16,0.08)' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E8D9C8' }}>
              <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.05rem', color: '#2C1810', fontWeight: 600 }}>All Staff Members</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>{['Name', 'Username', 'Contact', 'Role', 'Joined', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {loading ? <tr><td colSpan={6} style={{ ...tdStyle, textAlign: 'center', padding: 40, color: '#8C7B6E' }}>Loading...</td></tr>
                    : staffList.map(s => (
                      <tr key={s.id}>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FAF6F0', border: '1px solid #E8D9C8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>{s.role === 'admin' ? '👑' : '👤'}</div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{s.name}</div>
                              {s.id == currentUser.id && <span style={{ fontSize: '0.7rem', color: '#C8854A', fontWeight: 600 }}>(You)</span>}
                            </div>
                          </div>
                        </td>
                        <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '0.85rem' }}>@{s.username}</td>
                        <td style={{ ...tdStyle, fontSize: '0.85rem' }}>{s.contact || '—'}</td>
                        <td style={tdStyle}>
                          <span style={{ padding: '4px 12px', borderRadius: 50, fontSize: '0.78rem', fontWeight: 600, background: s.role === 'admin' ? '#F0FDF4' : '#EBF8FF', color: s.role === 'admin' ? '#166534' : '#2C7A9B' }}>
                            {s.role === 'admin' ? '👑 Admin' : '👤 Staff'}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, fontSize: '0.78rem', color: '#8C7B6E' }}>{new Date(s.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => openEdit(s)} style={{ padding: '5px 12px', borderRadius: 50, border: 'none', background: '#C8854A', color: 'white', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                            {s.id != currentUser.id && (
                              <button onClick={() => handleDelete(s.id)} style={{ padding: '5px 12px', borderRadius: 50, border: 'none', background: '#e53e3e', color: 'white', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Del</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{ background: 'white', borderRadius: 14, padding: 32, width: '100%', maxWidth: 460, boxShadow: '0 25px 80px rgba(28,16,9,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #E8D9C8' }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', color: '#2C1810' }}>{editStaff ? 'Edit Staff' : 'Add Staff Member'}</h3>
              <button onClick={() => setShowModal(false)} style={{ width: 34, height: 34, border: 'none', background: '#FAF6F0', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              {[['Full Name *', 'name', 'text', true], ['Contact Number', 'contact', 'tel', false], ['Username *', 'username', 'text', true]].map(([label, field, type, req]) => (
                <div key={field} style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#4A3728', marginBottom: 7 }}>{label}</label>
                  <input type={type} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} style={inputStyle} required={req} />
                </div>
              ))}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#4A3728', marginBottom: 7 }}>
                  Password {editStaff && <span style={{ fontWeight: 400, color: '#8C7B6E' }}>(leave blank to keep)</span>}
                </label>
                <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} style={inputStyle} required={!editStaff} autoComplete="new-password" />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#4A3728', marginBottom: 7 }}>Role *</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button type="submit" style={{ width: '100%', padding: 14, background: editStaff ? '#C8854A' : '#2C1810', color: '#FAF6F0', border: 'none', borderRadius: 50, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}>
                {editStaff ? 'Update Staff' : 'Add Staff'}
              </button>
            </form>
          </div>
        </div>
      )}

      {toast.show && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: toast.type === 'error' ? '#e53e3e' : '#7A8C6E', color: 'white', padding: '13px 22px', borderRadius: 8, fontSize: '0.88rem', zIndex: 9999 }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}