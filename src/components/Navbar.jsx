import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('darkMode') === 'true')
  const { count } = useCart()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', dark)
  }, [dark])
  
  const isActive = (path) => location.pathname === path

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-cream/95 backdrop-blur-md border-b border-[#E8D9C8] px-8 h-[72px] flex items-center justify-between transition-all ${scrolled ? 'shadow-md' : ''}`}>
      <Link to="/" className="flex items-center gap-3 no-underline">
        <div className="w-[42px] h-[42px] bg-coffee-dark rounded-full flex items-center justify-center font-playfair text-gold text-xl font-bold">K</div>
        <span className="font-playfair text-coffee-dark text-xl font-bold">Kenji's Cafe</span>
      </Link>

      <ul className={`${menuOpen ? 'flex' : 'hidden'} md:flex list-none gap-8 items-center`}>
        {[['/', 'Home'], ['/menu', 'Menu'], ['/order', 'Order'], ['/track', 'Track Order']].map(([path, label]) => (
          <li key={path}>
            <Link to={path} className={`no-underline font-medium text-sm transition-colors ${isActive(path) ? 'text-coffee-dark border-b-2 border-caramel pb-1' : 'text-coffee-mid hover:text-coffee-dark'}`}>
              {label}
            </Link>
          </li>
        ))}
        <li>
          <Link to="/order" className="bg-coffee-dark text-cream px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-caramel transition-colors no-underline">
            Order Now {count > 0 && <span className="ml-1 bg-gold text-coffee-dark rounded-full px-2 text-xs">{count}</span>}
          </Link>
        </li>
        <li>
          <button onClick={() => setDark(!dark)} className="w-9 h-9 rounded-full border border-[#E8D9C8] bg-transparent cursor-pointer text-lg flex items-center justify-center hover:bg-[#E8D9C8] transition-colors">
            {dark ? '☀️' : '🌙'}
          </button>
        </li>
      </ul>

      <button className="md:hidden flex flex-col gap-1.5 cursor-pointer p-1" onClick={() => setMenuOpen(!menuOpen)}>
        <span className="w-6 h-0.5 bg-coffee-dark rounded"></span>
        <span className="w-6 h-0.5 bg-coffee-dark rounded"></span>
        <span className="w-6 h-0.5 bg-coffee-dark rounded"></span>
      </button>
    </nav>
  )
}