import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Menu from './pages/Menu'
import Order from './pages/Order'
import Track from './pages/Track'
import Login from './pages/Login'
import AdminDashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import AdminOrders from './pages/admin/Orders'
import AdminStaff from './pages/admin/Staff'
import AdminReports from './pages/admin/Reports'
import AdminReviews from './pages/admin/Reviews'
import StaffDashboard from './pages/staff/Dashboard'
import { CartProvider } from './context/CartContext'

function ProtectedRoute({ children, role }) {
  const user = JSON.parse(localStorage.getItem('cafe_user') || 'null')
  if (!user) return <Navigate to="/login" />
  if (role === 'admin' && user.role !== 'admin') return <Navigate to="/staff" />
  return children
}

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/order" element={<Order />} />
          <Route path="/track" element={<Track />} />
          <Route path="/login" element={<Login />} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute role="admin"><AdminProducts /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute role="admin"><AdminOrders /></ProtectedRoute>} />
          <Route path="/admin/staff" element={<ProtectedRoute role="admin"><AdminStaff /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute role="admin"><AdminReports /></ProtectedRoute>} />
          <Route path="/admin/reviews" element={<ProtectedRoute role="admin"><AdminReviews /></ProtectedRoute>} />

          {/* Staff */}
          <Route path="/staff" element={<ProtectedRoute role="staff"><StaffDashboard /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}