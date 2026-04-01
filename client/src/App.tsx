import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Invoices from './pages/Invoices'
import UploadInvoice from './pages/UploadInvoice'
import Budgets from './pages/Budgets'
import Analytics from './pages/Analytics'
import Layout from './components/Layout'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  return token ? <>{children}</> : <Navigate to="/login" />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: { background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)', fontSize: 13, borderRadius: 8 },
          success: { iconTheme: { primary: '#00d97e', secondary: '#0a1a12' } },
          error: { iconTheme: { primary: '#f04444', secondary: '#fff' } }
        }} />
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard"        element={<Dashboard />} />
            <Route path="invoices"         element={<Invoices />} />
            <Route path="invoices/upload"  element={<UploadInvoice />} />
            <Route path="budgets"          element={<Budgets />} />
            <Route path="analytics"        element={<Analytics />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
