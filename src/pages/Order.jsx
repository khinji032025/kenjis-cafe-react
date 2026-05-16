import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import axios from 'axios'
import { API_BASE, IMG_BASE } from '../config'

const CAT_ICONS = { 'Hot Coffees': '☕', 'Iced Coffees': '🧊', 'Specialty Coffees': '✨', 'Pastries': '🥐' }
const CATEGORIES = ['Hot Coffees', 'Iced Coffees', 'Specialty Coffees', 'Pastries']

export default function Order() {
  const [products, setProducts] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [lastOrderId, setLastOrderId] = useState('')
  const [selectedPayment, setSelectedPayment] = useState('cash')
  const [selectedDelivery, setSelectedDelivery] = useState('pickup')
  const [form, setForm] = useState({ name: '', contact: '', address: '', special: '' })
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState({ show: false, msg: '', type: '' })
  const { cart, items, count, subtotal, discount, total, addToCart, removeFromCart, changeQty, clearCart } = useCart()

  useEffect(() => {
    axios.get(`${API_BASE}/get_products`)
      .then(res => setProducts(res.data.filter(p => p.available == 1 && p.stock > 0)))
      .finally(() => setLoading(false))
  }, [])

  function showToast(msg, type = '') {
    setToast({ show: true, msg, type })
    setTimeout(() => setToast({ show: false, msg: '', type: '' }), 3500)
  }

  const filtered = filter === 'all' ? products : products.filter(p => p.category === filter)

  async function handlePlaceOrder(e) {
    e.preventDefault()
    if (!form.name || !form.contact) { showToast('Please fill in all required fields.', 'error'); return }
    if (selectedDelivery === 'delivery' && !form.address) { showToast('Please enter delivery address.', 'error'); return }

    setSubmitting(true)
    try {
      const res = await axios.post(`${API_BASE}/place_order`, {
        customer_name: form.name,
        contact_number: form.contact,
        delivery_type: selectedDelivery,
        address: form.address,
        special_request: form.special,
        payment_method: selectedPayment,
        subtotal, discount, total_amount: total,
        items: items.map(i => ({ product_id: i.id, product_name: i.name, price: i.price, quantity: i.qty, subtotal: i.price * i.qty }))
      })
      if (res.data.success) {
        setLastOrderId(res.data.order_id)
        setShowOrderModal(false)
        setShowSuccessModal(true)
        clearCart()
        setForm({ name: '', contact: '', address: '', special: '' })
      } else {
        showToast(res.data.message || 'Failed to place order.', 'error')
      }
    } catch {
      showToast('Network error. Please try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <Navbar />
      <div style={{ paddingTop: 72 }}>
        <div className="bg-coffee-dark py-20 px-8 text-center">
          <span className="text-xs font-semibold tracking-widest uppercase text-gold block mb-3">Place Your Order</span>
          <h1 className="font-playfair text-white text-5xl font-bold">Order Online</h1>
          <p className="text-white/60 mt-3">Select your items and we'll prepare them fresh for you</p>
        </div>

        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="grid gap-8 grid-cols-1 lg:grid-cols-[1fr_380px]">

            {/* Products */}
            <div>
              <div className="flex gap-2.5 flex-wrap mb-8">
                {['all', ...CATEGORIES].map(cat => (
                  <button key={cat} onClick={() => setFilter(cat)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-all cursor-pointer ${filter === cat ? 'bg-coffee-dark text-cream border-coffee-dark' : 'bg-transparent text-coffee-mid border-[#E8D9C8] hover:border-coffee-dark'}`}>
                    {cat === 'all' ? 'All Items' : `${CAT_ICONS[cat]} ${cat}`}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="text-center py-20 text-coffee-mid">Loading products...</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  {filtered.map(p => (
                    <div key={p.id} className="bg-warm-white border border-[#E8D9C8] rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform shadow-sm">
                      <div className="h-36 bg-gradient-to-br from-[#e8d5b7] to-[#c8a96e] flex items-center justify-center text-4xl overflow-hidden">
                        {p.image ? <img src={`${IMG_BASE}/${p.image}`} alt={p.name} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none' }} /> : CAT_ICONS[p.category]}
                      </div>
                      <div className="p-4">
                        <div className="font-playfair font-semibold text-coffee-dark text-sm mb-1">{p.name}</div>
                        <div className="text-xs text-[#8C7B6E] mb-2">Stock: {p.stock}</div>
                        <div className="flex justify-between items-center">
                          <span className="font-playfair text-caramel font-bold">₱{Number(p.price).toFixed(2)}</span>
                          <button onClick={() => { addToCart({ id: p.id, name: p.name, price: Number(p.price), stock: Number(p.stock), cat: p.category }); showToast(`✓ ${p.name} added!`, 'success') }}
                            className="bg-caramel text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-coffee-mid transition-colors cursor-pointer border-none">
                            + Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart */}
            <div className="sticky top-[90px]">
              <div className="bg-warm-white border border-[#E8D9C8] rounded-2xl overflow-hidden shadow-md">
                <div className="bg-coffee-dark px-6 py-5 flex justify-between items-center">
                  <h3 className="font-playfair text-white text-lg">🛒 Your Cart</h3>
                  <span className="bg-gold text-coffee-dark rounded-full px-3 py-0.5 text-xs font-bold">{count} item{count !== 1 ? 's' : ''}</span>
                </div>

                <div className="p-4 max-h-72 overflow-y-auto min-h-24">
                  {items.length === 0 ? (
                    <div className="text-center py-10 text-[#8C7B6E]">
                      <div className="text-4xl mb-3">🛒</div>
                      <p className="text-sm">Your cart is empty.<br />Add items from the menu!</p>
                    </div>
                  ) : items.map(item => (
                    <div key={item.id} className="flex items-center gap-3 py-2.5 border-b border-[#E8D9C8]/50 last:border-0">
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-coffee-dark">{item.name}</div>
                        <div className="text-caramel text-xs font-semibold">₱{(item.price * item.qty).toFixed(2)}</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {['−', item.qty, '+', '✕'].map((btn, i) => (
                          <button key={i} onClick={() => i === 0 ? changeQty(item.id, -1) : i === 2 ? changeQty(item.id, 1) : i === 3 ? removeFromCart(item.id) : null}
                            className={`w-6 h-6 rounded-full border border-[#E8D9C8] text-xs flex items-center justify-center cursor-pointer transition-all hover:bg-coffee-dark hover:text-white hover:border-coffee-dark ${i === 1 ? 'font-bold text-coffee-dark bg-transparent border-transparent cursor-default hover:bg-transparent hover:text-coffee-dark hover:border-transparent' : 'bg-transparent text-[#4A3728]'} ${i === 3 ? 'text-red-500 hover:bg-red-500 hover:border-red-500' : ''}`}>
                            {btn}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {items.length > 0 && (
                  <div className="border-t border-[#E8D9C8] p-5">
                    <div className="flex justify-between text-sm text-[#8C7B6E] mb-2"><span>Subtotal</span><span>₱{subtotal.toFixed(2)}</span></div>
                    {discount > 0 && <div className="flex justify-between text-sm text-sage mb-2"><span>10% Discount</span><span>-₱{discount.toFixed(2)}</span></div>}
                    <div className="flex justify-between font-bold text-coffee-dark text-base border-t border-[#E8D9C8] pt-3 mt-2"><span>Total</span><span>₱{total.toFixed(2)}</span></div>

                    {/* Payment */}
                    <div className="mt-4">
                      <div className="text-xs font-semibold text-[#4A3728] mb-2">Payment Method</div>
                      <div className="grid grid-cols-3 gap-2">
                        {[['cash', '💵', 'Cash'], ['gcash', '📱', 'GCash'], ['cod', '🚚', 'COD']].map(([val, icon, label]) => (
                          <button key={val} onClick={() => setSelectedPayment(val)}
                            className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${selectedPayment === val ? 'border-caramel bg-caramel/10 text-coffee-dark' : 'border-[#E8D9C8] text-[#4A3728] bg-transparent hover:border-caramel'}`}>
                            <span className="text-lg">{icon}</span>{label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button onClick={() => setShowOrderModal(true)}
                      className="w-full mt-4 py-3 bg-coffee-dark text-cream rounded-full font-semibold text-sm hover:bg-caramel transition-all cursor-pointer border-none">
                      Place Order →
                    </button>
                    <button onClick={clearCart}
                      className="w-full mt-2 py-2.5 bg-transparent text-coffee-mid rounded-full font-semibold text-sm border border-[#E8D9C8] hover:bg-[#E8D9C8] transition-all cursor-pointer">
                      Clear Cart
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowOrderModal(false)}>
          <div className="bg-warm-white rounded-2xl p-10 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-7">
              <h3 className="font-playfair text-coffee-dark text-2xl">Complete Your Order</h3>
              <button onClick={() => setShowOrderModal(false)} className="w-9 h-9 rounded-full bg-[#E8D9C8] border-none cursor-pointer text-[#4A3728] hover:bg-coffee-dark hover:text-white transition-all">✕</button>
            </div>
            <form onSubmit={handlePlaceOrder}>
              {[['Full Name *', 'text', 'name', 'Enter your full name'], ['Contact Number *', 'tel', 'contact', '09xxxxxxxxx']].map(([label, type, field, ph]) => (
                <div key={field} className="mb-5">
                  <label className="block text-sm font-semibold text-[#4A3728] mb-2">{label}</label>
                  <input type={type} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    placeholder={ph} required className="w-full px-4 py-3 border border-[#E8D9C8] rounded-lg text-sm bg-white outline-none focus:border-caramel transition-all" />
                </div>
              ))}

              <div className="mb-5">
                <label className="block text-sm font-semibold text-[#4A3728] mb-2">Delivery Option *</label>
                <div className="grid grid-cols-2 gap-3">
                  {[['pickup', '🏪', 'Pickup'], ['delivery', '🚚', 'Delivery']].map(([val, icon, label]) => (
                    <button key={val} type="button" onClick={() => setSelectedDelivery(val)}
                      className={`flex flex-col items-center gap-1 py-3 rounded-lg border font-semibold text-sm cursor-pointer transition-all ${selectedDelivery === val ? 'border-caramel bg-caramel/10 text-coffee-dark' : 'border-[#E8D9C8] text-[#4A3728] bg-white hover:border-caramel'}`}>
                      <span className="text-2xl">{icon}</span>{label}
                    </button>
                  ))}
                </div>
              </div>

              {selectedDelivery === 'delivery' && (
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-[#4A3728] mb-2">Delivery Address *</label>
                  <input type="text" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    placeholder="Enter your delivery address" required
                    className="w-full px-4 py-3 border border-[#E8D9C8] rounded-lg text-sm bg-white outline-none focus:border-caramel transition-all" />
                </div>
              )}

              <div className="mb-5">
                <label className="block text-sm font-semibold text-[#4A3728] mb-2">Special Request <span className="font-normal text-[#8C7B6E]">(optional)</span></label>
                <textarea value={form.special} onChange={e => setForm(f => ({ ...f, special: e.target.value }))}
                  placeholder="Any special instructions?" rows={3}
                  className="w-full px-4 py-3 border border-[#E8D9C8] rounded-lg text-sm bg-white outline-none focus:border-caramel transition-all resize-y" />
              </div>

              {/* Summary */}
              <div className="bg-cream rounded-lg p-4 mb-5 border border-[#E8D9C8]">
                <div className="text-xs font-bold uppercase tracking-wider text-[#4A3728] mb-3">Order Summary</div>
                {items.map(i => (
                  <div key={i.id} className="flex justify-between text-sm text-[#4A3728] mb-1.5">
                    <span>{i.name} x{i.qty}</span><span>₱{(i.price * i.qty).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold text-coffee-dark border-t border-[#E8D9C8] pt-2.5 mt-2">
                  <span>Total</span><span>₱{total.toFixed(2)}</span>
                </div>
              </div>

              <button type="submit" disabled={submitting}
                className="w-full py-3.5 bg-coffee-dark text-cream rounded-full font-semibold text-base hover:bg-caramel transition-all cursor-pointer border-none">
                {submitting ? 'Placing Order...' : '✓ Confirm Order'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-warm-white rounded-2xl p-10 w-full max-w-md text-center shadow-2xl">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="font-playfair text-coffee-dark text-2xl mb-3">Order Placed!</h3>
            <p className="text-[#8C7B6E] text-sm mb-6">Your order has been placed! Save your Order ID to track it.</p>
            <div className="bg-cream border-2 border-dashed border-caramel rounded-xl p-5 mb-6">
              <div className="text-xs uppercase tracking-widest text-[#8C7B6E] mb-2">Your Order ID</div>
              <div className="font-playfair text-coffee-dark text-3xl font-bold tracking-wide">{lastOrderId}</div>
            </div>

            {/* Cafe Location */}
            <div className="bg-cream border border-[#E8D9C8] rounded-xl p-4 mb-6 text-left">
              <div className="text-xs font-bold uppercase tracking-wider text-[#8C7B6E] mb-2">📍 Pickup Location</div>
              <div className="font-semibold text-coffee-dark text-sm mb-1">Kenji's Cafe</div>
              <div className="text-[#8C7B6E] text-xs mb-3">Ulbujan, Calape, Bohol · Open 9AM–9PM</div>
              <div className="rounded-lg overflow-hidden border border-[#E8D9C8]">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3924.5!2d123.8833!3d9.9167!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sUlbujan%2C+Calape%2C+Bohol!5e0!3m2!1sen!2sph!4v1234567890"
                  width="100%" height="160" style={{ border: 0, display: 'block' }} allowFullScreen loading="lazy" />
              </div>
              <a href="https://www.google.com/maps/search/Ulbujan+Calape+Bohol" target="_blank" rel="noreferrer"
                className="block text-center mt-2 text-xs text-caramel font-semibold no-underline hover:text-coffee-mid">
                Open in Google Maps →
              </a>
            </div>

            <div className="flex gap-3 justify-center">
              <button onClick={() => { setShowSuccessModal(false); window.location.href = `/track?id=${lastOrderId}` }}
                className="bg-coffee-dark text-cream px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-caramel transition-all cursor-pointer border-none">
                Track Order
              </button>
              <button onClick={() => setShowSuccessModal(false)}
                className="bg-transparent text-coffee-dark px-6 py-2.5 rounded-full font-semibold text-sm border border-[#E8D9C8] hover:bg-[#E8D9C8] transition-all cursor-pointer">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <div className={`fixed bottom-7 right-7 z-50 px-6 py-3.5 rounded-lg shadow-lg text-white text-sm font-medium transition-all ${toast.type === 'success' ? 'bg-sage' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      <Footer />
    </div>
  )
}