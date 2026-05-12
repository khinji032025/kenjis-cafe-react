import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import axios from 'axios'
import { API_BASE, IMG_BASE } from '../config'

const CAT_ICONS = { 'Hot Coffees': '☕', 'Iced Coffees': '🧊', 'Specialty Coffees': '✨', 'Pastries': '🥐' }
const CATEGORIES = ['Hot Coffees', 'Iced Coffees', 'Specialty Coffees', 'Pastries']

export default function Menu() {
  const [products, setProducts] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${API_BASE}/get_products`)
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = products.filter(p => {
    const matchCat = filter === 'all' || p.category === filter
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const byCat = CATEGORIES.reduce((acc, cat) => {
    const items = filtered.filter(p => p.category === cat)
    if (items.length > 0) acc[cat] = items
    return acc
  }, {})

  return (
    <div>
      <Navbar />
      <div style={{ paddingTop: 72 }}>
        {/* Hero */}
        <div className="bg-coffee-dark py-20 px-8 text-center relative overflow-hidden">
          <span className="text-xs font-semibold tracking-widest uppercase text-gold block mb-3">What We Serve</span>
          <h1 className="font-playfair text-white text-5xl font-bold">Our Menu</h1>
          <p className="text-white/60 mt-3">From handcrafted coffees to freshly baked pastries</p>
        </div>

        <div className="max-w-6xl mx-auto px-8 py-16">
          {/* Search */}
          <div className="flex justify-center mb-8">
            <div className="relative w-full max-w-md">
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="🔍 Search products..."
                className="w-full py-3.5 pl-12 pr-4 border border-[#E8D9C8] rounded-full text-sm bg-warm-white outline-none focus:border-caramel transition-all"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2.5 flex-wrap justify-center mb-12">
            {['all', ...CATEGORIES].map(cat => (
              <button key={cat} onClick={() => setFilter(cat)}
                className={`px-5 py-2 rounded-full border text-sm font-medium transition-all cursor-pointer ${filter === cat ? 'bg-coffee-dark text-cream border-coffee-dark' : 'bg-transparent text-coffee-mid border-[#E8D9C8] hover:border-coffee-dark'}`}>
                {cat === 'all' ? '☕ All Items' : `${CAT_ICONS[cat]} ${cat}`}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20 text-coffee-mid">Loading menu...</div>
          ) : Object.keys(byCat).length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-[#8C7B6E]">No products found</p>
            </div>
          ) : (
            Object.entries(byCat).map(([cat, items]) => (
              <div key={cat} className="mb-14">
                <div className="flex items-center gap-4 mb-7">
                  <span className="text-3xl">{CAT_ICONS[cat]}</span>
                  <div>
                    <h2 className="font-playfair text-coffee-dark text-2xl font-semibold">{cat}</h2>
                    <p className="text-[#8C7B6E] text-sm">{items.length} item{items.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {items.map(p => (
                    <div key={p.id} className="bg-warm-white border border-[#E8D9C8] rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform shadow-sm hover:shadow-md">
                      <div className="h-44 bg-gradient-to-br from-[#e8d5b7] to-[#c8a96e] flex items-center justify-center text-5xl relative overflow-hidden">
                        {p.image ? <img src={`${IMG_BASE}/${p.image}`} alt={p.name} className="w-full h-full object-cover" onError={e => { e.target.style.display='none' }} /> : CAT_ICONS[p.category]}
                        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${p.available && p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {p.available && p.stock > 0 ? '✓ Available' : '✕ Unavailable'}
                        </span>
                      </div>
                      <div className="p-4">
                        <h3 className="font-playfair font-semibold text-coffee-dark mb-1">{p.name}</h3>
                        <p className="text-[#8C7B6E] text-xs leading-relaxed mb-3 line-clamp-2">{p.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="font-playfair text-caramel font-bold text-lg">₱{Number(p.price).toFixed(2)}</span>
                          {p.available && p.stock > 0 ? (
                            <Link to="/order" className="bg-caramel text-white px-4 py-1.5 rounded-full text-xs font-semibold no-underline hover:bg-coffee-mid transition-colors">+ Add</Link>
                          ) : (
                            <span className="text-red-500 text-xs font-semibold bg-red-50 px-3 py-1.5 rounded-full">Sold Out</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}