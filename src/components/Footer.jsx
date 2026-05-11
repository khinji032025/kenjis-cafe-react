import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-coffee-dark text-white/80 pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <span className="font-playfair text-white text-2xl block mb-3">Kenji's Cafe</span>
            <p className="text-white/60 text-sm leading-relaxed mb-5">A warm corner of Bohol where every cup tells a story.</p>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-white/60">📍 Ulbujan, Calape, Bohol</span>
              <span className="text-sm text-white/60">📞 0991 767 2359</span>
              <span className="text-sm text-white/60">🕐 Mon–Sun, 9AM – 9PM</span>
            </div>
          </div>
          <div>
            <h4 className="font-playfair text-white text-base mb-4">Quick Links</h4>
            <ul className="flex flex-col gap-2.5">
              {[['/', 'Home'], ['/menu', 'Menu'], ['/order', 'Order Now'], ['/track', 'Track Order']].map(([path, label]) => (
                <li key={path}><Link to={path} className="text-white/60 text-sm no-underline hover:text-gold transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-playfair text-white text-base mb-4">Promotions</h4>
            <ul className="flex flex-col gap-2.5">
              {['☕ Free WiFi', '🎉 10% off over ₱500', '🚚 Free delivery over ₱300'].map(p => (
                <li key={p}><span className="text-white/60 text-sm">{p}</span></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 flex justify-between items-center flex-wrap gap-3">
          <p className="text-white/40 text-xs">© {new Date().getFullYear()} Kenji's Cafe. All rights reserved.</p>
          <p className="text-white/40 text-xs">Made with ☕ in Bohol</p>
        </div>
      </div>
    </footer>
  )
}