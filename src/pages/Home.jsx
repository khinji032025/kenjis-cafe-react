import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const slides = [
  {
    label: '☕ Ulbujan, Calape, Bohol',
    title: <>Your Perfect Cup,<br /><em className="text-gold italic">Every Single Day</em></>,
    desc: "Discover Bohol's finest café experience — from handcrafted coffees to freshly baked pastries.",
    btns: [{ to: '/order', label: 'Order Now', primary: true }, { to: '/menu', label: 'View Menu', primary: false }]
  },
  {
    label: '🎉 Special Offers',
    title: <>Our <em className="text-gold italic">Promotions</em></>,
    cards: [
      { icon: '📶', title: 'Free WiFi', desc: 'Stay connected while you enjoy your coffee' },
      { icon: '🎉', title: '10% Discount', desc: 'On all orders above ₱500' },
      { icon: '🚚', title: 'Free Delivery', desc: 'Orders above ₱300 in nearby areas' },
    ],
    btn: { to: '/order', label: 'Order Now' }
  },
  {
    label: '⭐ Must Try',
    title: <>Featured <em className="text-gold italic">Products</em></>,
    cards: [
      { icon: '☕', title: "Kenji's Special Blend", desc: 'Our signature Bohol-inspired coffee', price: '₱150' },
      { icon: '🥐', title: 'Freshly Baked Pastries', desc: 'Baked fresh every day', price: 'From ₱50' },
      { icon: '🏝️', title: 'Local Bohol Delicacies', desc: 'Authentic Bohol flavors', price: 'Ask us!' },
    ],
    btn: { to: '/menu', label: 'View Full Menu' }
  },
  {
    label: '📍 Visit Us',
    title: <>Come & <em className="text-gold italic">Experience</em><br />Kenji's Cafe</>,
    desc: 'Located in the heart of Calape, Bohol. A warm corner where every cup tells a story.',
    cards: [
      { icon: '📍', title: 'Ulbujan, Calape', desc: 'Bohol' },
      { icon: '🕐', title: 'Mon–Sun', desc: '9AM – 9PM' },
      { icon: '📞', title: '09917672359', desc: '' },
    ],
    btns: [{ to: '/order', label: 'Order Now', primary: true }, { to: '/track', label: 'Track Order', primary: false }]
  }
]

export default function Home() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setCurrent(c => (c + 1) % slides.length), 5000)
    return () => clearInterval(timer)
  }, [])

  const slide = slides[current]

  return (
    <div className="overflow-hidden">
      <Navbar />
      <div className="relative h-screen overflow-hidden" style={{ marginTop: 0 }}>
        {/* Background */}
        <div className="absolute inset-0 bg-cover bg-center transition-all duration-700" style={{ backgroundImage: "url('/images/cafe_background.jpg')" }} />
        <div className="absolute inset-0 bg-black/60" />

        {/* Slide Content */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-8">
          <span className="text-xs font-semibold tracking-widest uppercase text-gold block mb-4">{slide.label}</span>
          <h1 className="font-playfair text-white leading-tight mb-6" style={{ fontSize: 'clamp(2.2rem,5vw,3.8rem)' }}>{slide.title}</h1>
          {slide.desc && <p className="text-white/80 text-base mb-8 max-w-lg leading-relaxed">{slide.desc}</p>}

          {slide.cards && (
            <div className="grid grid-cols-3 gap-5 max-w-2xl w-full mb-8">
              {slide.cards.map((c, i) => (
                <div key={i} className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-sm text-center">
                  <div className="text-3xl mb-3">{c.icon}</div>
                  <div className="font-playfair text-white font-semibold mb-1 text-base">{c.title}</div>
                  <div className="text-white/75 text-sm">{c.desc}</div>
                  {c.price && <div className="text-gold font-bold mt-2">{c.price}</div>}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 flex-wrap justify-center">
            {slide.btns ? slide.btns.map((b, i) => (
              <Link key={i} to={b.to} className={`px-8 py-3.5 rounded-full font-semibold text-base no-underline transition-all ${b.primary ? 'bg-caramel text-white hover:bg-coffee-mid' : 'border border-white/40 text-white hover:bg-white/10'}`}>
                {b.label}
              </Link>
            )) : slide.btn && (
              <Link to={slide.btn.to} className="bg-caramel text-white px-9 py-3.5 rounded-full font-semibold text-base no-underline hover:bg-coffee-mid transition-all">
                {slide.btn.label}
              </Link>
            )}
          </div>
        </div>

        {/* Arrows */}
        <button onClick={() => setCurrent(c => (c - 1 + slides.length) % slides.length)} className="absolute left-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/15 border border-white/30 text-white text-xl cursor-pointer hover:bg-white/25 transition-all">‹</button>
        <button onClick={() => setCurrent(c => (c + 1) % slides.length)} className="absolute right-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/15 border border-white/30 text-white text-xl cursor-pointer hover:bg-white/25 transition-all">›</button>

        {/* Dots */}
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} className={`h-2.5 rounded-full border-none cursor-pointer transition-all ${i === current ? 'bg-gold w-7' : 'bg-white/35 w-2.5'}`} />
          ))}
        </div>

        {/* Slide Number */}
        <div className="absolute bottom-7 right-7 z-20 text-white/50 text-xs">{current + 1} / {slides.length}</div>
      </div>
    </div>
  )
}