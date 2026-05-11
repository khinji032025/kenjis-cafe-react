import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../../components/AdminSidebar'
import axios from 'axios'
import { API_BASE } from "../../config";

const CATEGORIES = ['Hot Coffees', 'Iced Coffees', 'Specialty Coffees', 'Pastries']
const CAT_ICONS = { 'Hot Coffees': '☕', 'Iced Coffees': '🧊', 'Specialty Coffees': '✨', 'Pastries': '🥐' }

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterCat, setFilterCat] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showStockModal, setShowStockModal] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [stockProduct, setStockProduct] = useState(null)
  const [addStock, setAddStock] = useState(10)
  const [toast, setToast] = useState({ show: false, msg: '', type: '' })
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: 20, category: 'Hot Coffees', available: true })
  const [imageFile, setImageFile] = useState(null)

  useEffect(() => { fetchProducts() }, [])

  function fetchProducts() {
    setLoading(true)
    axios.get(`${API_BASE}/get_products.php`)
      .then(res => setProducts(res.data))
      .finally(() => setLoading(false))
  }

  function showToast(msg, type = 'success') {
    setToast({ show: true, msg, type })
    setTimeout(() => setToast({ show: false, msg: '', type: '' }), 3000)
  }

  function openEdit(p) {
    setEditProduct(p)
    setForm({ name: p.name, description: p.description, price: p.price, stock: p.stock, category: p.category, available: p.available == 1 })
    setImageFile(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const formData = new FormData()
    Object.entries(form).forEach(([k, v]) => formData.append(k, v))
    if (imageFile) formData.append('image', imageFile)
    if (editProduct) formData.append('id', editProduct.id)
    formData.append('action', editProduct ? 'edit' : 'add')

    try {
      await axios.post(`${API_BASE}/admin_products.php`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      showToast(editProduct ? 'Product updated!' : 'Product added!')
      setShowAddModal(false)
      setEditProduct(null)
      setForm({ name: '', description: '', price: '', stock: 20, category: 'Hot Coffees', available: true })
      fetchProducts()
    } catch {
      showToast('Failed. Please try again.', 'error')
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this product?')) return
    try {
      await axios.post(`${API_BASE}/admin_products.php`, new URLSearchParams({ action: 'delete', id }))
      showToast('Product deleted.')
      fetchProducts()
    } catch {
      showToast('Failed to delete.', 'error')
    }
  }

  async function handleAddStock(e) {
    e.preventDefault()
    try {
      await axios.post(`${API_BASE}/admin_products.php`, new URLSearchParams({ action: 'add_stock', id: stockProduct.id, add_stock: addStock }))
      showToast('Stock updated!')
      setShowStockModal(false)
      fetchProducts()
    } catch {
      showToast('Failed.', 'error')
    }
  }

  const filtered = filterCat === 'all' ? products : products.filter(p => p.category === filterCat)

  const tdStyle = { padding: '14px 18px', fontSize: '0.88rem', color: '#1E1209', borderBottom: '1px solid rgba(232,217,200,0.5)', verticalAlign: 'middle' }
  const thStyle = { padding: '13px 18px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#8C7B6E', textTransform: 'uppercase', letterSpacing: '0.06em', background: '#FAF6F0', borderBottom: '1px solid #E8D9C8' }
  const inputStyle = { width: '100%', padding: '11px 14px', border: '1.5px solid #E8D9C8', borderRadius: 8, fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', color: '#1E1209', background: 'white', outline: 'none' }

  return (
    <div style={{ display: 'flex', fontFamily: 'DM Sans, sans-serif' }}>
      <AdminSidebar />
      <div style={{ marginLeft: 260, flex: 1, minHeight: '100vh', background: '#F4EDE4' }}>
        <div style={{ background: 'white', borderBottom: '1px solid #E8D9C8', padding: '0 28px', height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 8px rgba(44,24,16,0.08)' }}>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: '#2C1810', fontWeight: 600 }}>Products Management</span>
          <button onClick={() => { setEditProduct(null); setForm({ name: '', description: '', price: '', stock: 20, category: 'Hot Coffees', available: true }); setShowAddModal(true) }}
            style={{ padding: '9px 20px', background: '#2C1810', color: '#FAF6F0', border: 'none', borderRadius: 50, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
            + Add Product
          </button>
        </div>

        <div style={{ padding: 28 }}>
          {/* Filter */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {['all', ...CATEGORIES].map(cat => (
              <button key={cat} onClick={() => setFilterCat(cat)}
                style={{ padding: '7px 16px', borderRadius: 50, border: '1.5px solid', borderColor: filterCat === cat ? '#2C1810' : '#E8D9C8', background: filterCat === cat ? '#2C1810' : 'transparent', color: filterCat === cat ? '#FAF6F0' : '#4A3728', fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                {cat === 'all' ? 'All' : `${CAT_ICONS[cat]} ${cat}`}
              </button>
            ))}
          </div>

          <div style={{ background: 'white', border: '1px solid #E8D9C8', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(44,24,16,0.08)' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E8D9C8' }}>
              <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.05rem', color: '#2C1810', fontWeight: 600 }}>All Products ({filtered.length})</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>{['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {loading ? <tr><td colSpan={6} style={{ ...tdStyle, textAlign: 'center', padding: 40, color: '#8C7B6E' }}>Loading...</td></tr>
                    : filtered.map(p => (
                      <tr key={p.id}>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 48, height: 48, borderRadius: 8, background: 'linear-gradient(135deg,#e8d5b7,#c8a96e)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
                              {p.image ? <img src={`${IMG_BASE}/${p.image}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} /> : CAT_ICONS[p.category]}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{p.name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#8C7B6E', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</div>
                            </div>
                          </div>
                        </td>
                        <td style={tdStyle}>{CAT_ICONS[p.category]} {p.category}</td>
                        <td style={{ ...tdStyle, fontWeight: 700, color: '#C8854A' }}>₱{Number(p.price).toFixed(2)}</td>
                        <td style={{ ...tdStyle, fontWeight: 700, color: p.stock <= 5 ? '#e53e3e' : '#1E1209' }}>{p.stock}{p.stock <= 5 && <span style={{ color: '#e53e3e', fontSize: '0.7rem', marginLeft: 4 }}>Low</span>}</td>
                        <td style={tdStyle}>
                          <span style={{ padding: '4px 12px', borderRadius: 50, fontSize: '0.78rem', fontWeight: 600, background: p.available && p.stock > 0 ? 'rgba(122,140,110,0.12)' : 'rgba(229,62,62,0.1)', color: p.available && p.stock > 0 ? '#7A8C6E' : '#e53e3e' }}>
                            {p.available && p.stock > 0 ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => { setStockProduct(p); setShowStockModal(true) }} style={{ padding: '5px 12px', borderRadius: 50, border: '1.5px solid #E8D9C8', background: 'transparent', color: '#2C1810', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>+ Stock</button>
                            <button onClick={() => { openEdit(p); setShowAddModal(true) }} style={{ padding: '5px 12px', borderRadius: 50, border: 'none', background: '#C8854A', color: 'white', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                            <button onClick={() => handleDelete(p.id)} style={{ padding: '5px 12px', borderRadius: 50, border: 'none', background: '#e53e3e', color: 'white', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Del</button>
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
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowAddModal(false)}>
          <div style={{ background: 'white', borderRadius: 14, padding: 32, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 80px rgba(28,16,9,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #E8D9C8' }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', color: '#2C1810' }}>{editProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => { setShowAddModal(false); setEditProduct(null) }} style={{ width: 34, height: 34, border: 'none', background: '#FAF6F0', borderRadius: '50%', cursor: 'pointer', fontSize: '1rem', color: '#4A3728' }}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              {[['Product Name *', 'name', 'text'], ['Description', 'description', 'text']].map(([label, field, type]) => (
                <div key={field} style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#4A3728', marginBottom: 7 }}>{label}</label>
                  {field === 'description' ? (
                    <textarea value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} />
                  ) : (
                    <input type={type} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} style={inputStyle} required={field === 'name'} />
                  )}
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#4A3728', marginBottom: 7 }}>Price (₱) *</label>
                  <input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} style={inputStyle} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#4A3728', marginBottom: 7 }}>Stock *</label>
                  <input type="number" min="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} style={inputStyle} required />
                </div>
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#4A3728', marginBottom: 7 }}>Category *</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#4A3728', marginBottom: 7 }}>{editProduct ? 'Replace Image' : 'Product Image'}</label>
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <input type="checkbox" id="avail" checked={form.available} onChange={e => setForm(f => ({ ...f, available: e.target.checked }))} style={{ width: 'auto' }} />
                <label htmlFor="avail" style={{ fontSize: '0.88rem', color: '#4A3728' }}>Available for ordering</label>
              </div>
              <button type="submit" style={{ width: '100%', padding: 14, background: editProduct ? '#C8854A' : '#2C1810', color: '#FAF6F0', border: 'none', borderRadius: 50, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}>
                {editProduct ? 'Update Product' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Stock Modal */}
      {showStockModal && stockProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowStockModal(false)}>
          <div style={{ background: 'white', borderRadius: 14, padding: 32, width: '100%', maxWidth: 380, boxShadow: '0 25px 80px rgba(28,16,9,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', color: '#2C1810' }}>Add Stock</h3>
              <button onClick={() => setShowStockModal(false)} style={{ width: 34, height: 34, border: 'none', background: '#FAF6F0', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
            </div>
            <p style={{ marginBottom: 16, fontSize: '0.9rem', color: '#4A3728' }}>Adding stock to: <strong>{stockProduct.name}</strong></p>
            <form onSubmit={handleAddStock}>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#4A3728', marginBottom: 7 }}>Amount to Add *</label>
                <input type="number" min="1" value={addStock} onChange={e => setAddStock(e.target.value)} style={inputStyle} required />
              </div>
              <button type="submit" style={{ width: '100%', padding: 12, background: '#2C1810', color: '#FAF6F0', border: 'none', borderRadius: 50, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, cursor: 'pointer' }}>Add Stock</button>
            </form>
          </div>
        </div>
      )}

      {toast.show && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: toast.type === 'error' ? '#e53e3e' : '#7A8C6E', color: 'white', padding: '13px 22px', borderRadius: 8, fontSize: '0.88rem', zIndex: 9999, boxShadow: '0 8px 32px rgba(44,24,16,0.12)' }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}