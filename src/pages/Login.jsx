import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_BASE, IMG_BASE } from '../config'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await axios.post(`${API_BASE}/login.php`, { username, password })
      if (res.data.success) {
        localStorage.setItem('cafe_user', JSON.stringify(res.data.user))
        if (res.data.user.role === 'admin') navigate('/admin')
        else navigate('/staff')
      } else {
        setError(res.data.message)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-coffee-dark flex items-center justify-center p-5" style={{
      background: 'radial-gradient(circle at 80% 20%, rgba(212,168,83,0.15) 0%, transparent 60%), #2C1810'
    }}>
      <div className="bg-cream rounded-2xl p-12 w-full max-w-sm shadow-2xl" style={{ animation: 'slideUp 0.5s ease' }}>
        <div className="w-16 h-16 bg-coffee-dark rounded-full flex items-center justify-center font-playfair text-gold text-2xl font-bold mx-auto mb-5">K</div>
        <h1 className="font-playfair text-coffee-dark text-2xl font-bold text-center mb-1">Staff Portal</h1>
        <p className="text-center text-[#8C7B6E] text-sm mb-8">Kenji's Cafe — Team Access</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-5">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#4A3728] mb-2">Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              placeholder="Enter username" required
              className="w-full px-4 py-3 border border-[#E8D9C8] rounded-lg text-sm bg-white outline-none focus:border-caramel transition-all"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#4A3728] mb-2">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Enter password" required
              className="w-full px-4 py-3 border border-[#E8D9C8] rounded-lg text-sm bg-white outline-none focus:border-caramel transition-all"
            />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-coffee-dark text-cream rounded-full font-semibold text-sm hover:bg-coffee-mid transition-all cursor-pointer border-none">
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <a href="/" className="block text-center mt-5 text-[#5C3D2E] text-sm no-underline hover:text-caramel transition-colors">
          ← Back to Cafe Website
        </a>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}