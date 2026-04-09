import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Zap, ArrowRight, Lock, Mail } from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      login(data.token, data.user)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      {/* Left panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 48 }}>
        <div style={{ width: '100%', maxWidth: 380 }} className="animate-fade-up">
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} color="#0a1a12" fill="#0a1a12" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>ExpenseAI</span>
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', marginBottom: 6, letterSpacing: '-0.5px' }}>Sign in</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 32 }}>Continue to your expense dashboard</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                <input type="email" required value={form.email} placeholder="your-email@domain.com"
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input" style={{ paddingLeft: 36 }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                <input type="password" required value={form.password} placeholder="••••••••"
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input" style={{ paddingLeft: 36 }} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 6, padding: '11px 18px' }}>
              {loading ? 'Signing in...' : <><span>Sign In</span><ArrowRight size={15} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-3)', marginTop: 24 }}>
            No account?{' '}
            <Link to="/register" style={{ color: 'var(--green)', fontWeight: 500, textDecoration: 'none' }}>Create one</Link>
          </p>

        </div>
      </div>

      {/* Right panel */}
      <div style={{
        width: 480, background: 'var(--surface)', borderLeft: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 56,
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'var(--green)', opacity: 0.04, filter: 'blur(60px)' }} />
        <div className="animate-fade-up-1">
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)', marginBottom: 16, letterSpacing: '0.06em', textTransform: 'uppercase' }}>What you get</div>
          {[
            { icon: '⚡', title: 'AI Invoice Extraction', desc: 'Upload any invoice and GPT-4o reads vendor, amount, and line items instantly.' },
            { icon: '📊', title: 'Spending Analytics', desc: 'Charts, trends, and category breakdowns. Know exactly where money goes.' },
            { icon: '🎯', title: 'Budget Tracking', desc: 'Set limits per category. Get alerts before you overspend.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{ display: 'flex', gap: 14, marginBottom: 28 }}>
              <div style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{icon}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
