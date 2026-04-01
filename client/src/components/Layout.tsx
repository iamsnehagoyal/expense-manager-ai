import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, Upload, PiggyBank, LogOut, TrendingUp, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const nav = [
  { to: '/dashboard',        icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/invoices',         icon: FileText,        label: 'Invoices'  },
  { to: '/invoices/upload',  icon: Upload,          label: 'Upload'    },
  { to: '/budgets',          icon: PiggyBank,       label: 'Budgets'   },
  { to: '/analytics',        icon: TrendingUp,      label: 'Analytics' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: 'var(--surface)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', flexShrink: 0
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7, background: 'var(--green)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Zap size={15} color="#0a1a12" fill="#0a1a12" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', letterSpacing: '-0.2px' }}>ExpenseAI</div>
              <div style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 0 }}>Invoice Manager</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', padding: '6px 8px 4px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Menu</div>
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/invoices'}
              className={({ isActive }) => isActive ? 'nav-active' : 'nav-inactive'}
              style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 7, fontSize: 13.5, fontWeight: 500, textDecoration: 'none', transition: 'all 0.15s' }}>
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', marginBottom: 2 }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%', background: 'var(--green-dim)',
              border: '1px solid var(--green-border)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--green)', flexShrink: 0
            }}>{user?.name?.[0]?.toUpperCase()}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="nav-inactive"
            style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 10px', borderRadius: 7, fontSize: 13, width: '100%', background: 'none', cursor: 'pointer', transition: 'all 0.15s' }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto', padding: '32px 36px' }}>
        <Outlet />
      </main>
    </div>
  )
}
