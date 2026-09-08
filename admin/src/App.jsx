import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AdminLayout from './components/Layout/AdminLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Invoices from './pages/Invoices'
import Quotations from './pages/Quotations'
import Products from './pages/Products'
import Settings from './pages/Settings'
import ContactSubmissions from './pages/ContactSubmissions'
import NotFound from './pages/NotFound'
import NetworkStatus from './components/NetworkStatus/NetworkStatus'

function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-k-black flex items-center justify-center">
        <div className="flex gap-2">
          <span className="w-2 h-2 rounded-full bg-k-silver animate-pulse" />
          <span className="w-2 h-2 rounded-full bg-k-silver animate-pulse" style={{ animationDelay: '0.2s' }} />
          <span className="w-2 h-2 rounded-full bg-k-silver animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    )
  }

  return admin ? children : <Navigate to="/login" />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/quotations" element={<Quotations />} />
                <Route path="/products" element={<Products />} />
                <Route path="/submissions" element={<ContactSubmissions />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <NetworkStatus />
      <AppRoutes />
    </AuthProvider>
  )
}
