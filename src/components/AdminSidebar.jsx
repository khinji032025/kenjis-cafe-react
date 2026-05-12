import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function AdminSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('cafe_user') || '{}')

  function logout() {
    localStorage.removeItem('cafe_user')
    navigate('/login')
  }

  const links = [
    { path: '/admin', icon: '📊', label: 'Dashboard', section: 'Main' },
    { path: '/admin/products', icon: '☕', label: 'Products', section: 'Manage' },
    { path: '/admin/orders', icon: '📋', label: 'Orders', section: 'Manage' },
    { path: '/admin/staff', icon: '👥', label: 'Staff', section: 'Manage' },
    { path: '/admin/reports', icon: '📈', label: 'Sales Report', section: 'Site' },
    { path: '/admin/reviews', icon: '⭐', label: 'Reviews', section: 'Site' },
  ]

  const sections = ['Main', 'Manage', 'Site']

  return (
    <aside style={{ width: 260, minHeight: '100vh', background: '#2C1810', position: 'fixed', top: 0, left: 0, display: 'flex', flexDirection: 'column', zIndex: 100 }}>
      <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 42, height: 42, background: '#D4A853', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Playfair Display, serif', color: '#2C1810', fontSize: '1.15rem', fontWeight: 700 }}>K</div>
        <div>
          <div style={{ fontFamily: 'Playfair Display, serif', color: 'white', fontSize: '1rem' }}>Kenji's Cafe</div>
          <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Admin Panel</div>
        </div>
      </div>

      <nav style={{ padding: '16px 12px', flex: 1 }}>
        {sections.map(section => (
          <div key={section}>
            <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', padding: '12px 10px 6px' }}>{section}</div>
            {links.filter(l => l.section === section).map(link => (
              <Link key={link.path} to={link.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 8,
                  color: location.pathname === link.path ? '#D4A853' : 'rgba(255,255,255,0.65)',
                  textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500, marginBottom: 3,
                  background: location.pathname === link.path ? 'rgba(200,133,74,0.2)' : 'transparent',
                  borderLeft: location.pathname === link.path ? '3px solid #D4A853' : '3px solid transparent',
                  transition: 'all 0.2s'
                }}>
                <span>{link.icon}</span>{link.label}
              </Link>
            ))}
          </div>
        ))}
        <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', padding: '12px 10px 6px' }}>Site</div>
        <a href="https://kenjis-cafe-react.vercel.app" target="_blank" rel="noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 8, color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500 }}>
          🌐 View Website
        </a>
      </nav>

      <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', marginBottom: 8 }}>
          <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>👤</div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'white', fontWeight: 600 }}>{user.name || 'Admin'}</div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)' }}>Admin</div>
          </div>
        </div>
        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', width: '100%', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(229,62,62,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}>
          🚪 Logout
        </button>
      </div>
    </aside>
  )
}