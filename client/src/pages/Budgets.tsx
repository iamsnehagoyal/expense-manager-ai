import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'

const CATEGORIES = ['Food', 'Travel', 'Software', 'Office', 'Marketing', 'Utilities', 'Other']
const CAT_ICONS: Record<string, string> = { Food: '🍔', Travel: '✈️', Software: '💻', Office: '🏢', Marketing: '📣', Utilities: '⚡', Other: '📦' }

export default function Budgets() {
  const [budgets, setBudgets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ category: 'Food', monthlyLimit: '' })
  const [saving, setSaving] = useState(false)

  const fetch = () => { setLoading(true); api.get('/budgets').then(r => setBudgets(r.data)).finally(() => setLoading(false)) }
  useEffect(() => { fetch() }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/budgets', form)
      toast.success('Budget saved!')
      setForm({ category: 'Food', monthlyLimit: '' })
      fetch()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setSaving(false) }
  }

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
  const totalBudget = budgets.reduce((s, b) => s + b.monthlyLimit, 0)
  const totalSpent  = budgets.reduce((s, b) => s + b.spent, 0)

  return (
    <div className="animate-fade-up" style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px', marginBottom: 4 }}>Budgets</h1>
        <p style={{ color: 'var(--text-3)', fontSize: 13.5 }}>Monthly spending limits per category</p>
      </div>

      {/* Summary bar */}
      {budgets.length > 0 && (
        <div className="card animate-fade-up-1" style={{ padding: 20, marginBottom: 20, display: 'flex', gap: 32 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 6 }}>Total Budget</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 500, color: 'var(--text)' }}>{fmt(totalBudget)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 6 }}>Spent</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 500, color: totalSpent / totalBudget > 0.8 ? 'var(--red)' : 'var(--green)' }}>{fmt(totalSpent)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 6 }}>Remaining</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 500, color: 'var(--blue)' }}>{fmt(Math.max(0, totalBudget - totalSpent))}</div>
          </div>
        </div>
      )}

      {/* Set budget form */}
      <div className="card animate-fade-up-2" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text)', marginBottom: 14 }}>Set Monthly Budget</div>
        <form onSubmit={save} style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-3)', display: 'block', marginBottom: 5 }}>Category</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input" style={{ fontSize: 13 }}>
              {CATEGORIES.map(c => <option key={c}>{CAT_ICONS[c]} {c}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-3)', display: 'block', marginBottom: 5 }}>Monthly Limit (₹)</label>
            <input type="number" required placeholder="e.g. 10000" value={form.monthlyLimit}
              onChange={e => setForm({ ...form, monthlyLimit: e.target.value })}
              className="input" style={{ fontSize: 13 }} />
          </div>
          <button type="submit" disabled={saving} className="btn-primary" style={{ flexShrink: 0 }}>
            {saving ? 'Saving...' : 'Set Budget'}
          </button>
        </form>
      </div>

      {/* Budget cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? [...Array(4)].map((_, i) => (
          <div key={i} className="card" style={{ padding: 20 }}>
            <div className="skeleton" style={{ height: 12, width: '30%', marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 8, width: '100%' }} />
          </div>
        )) : budgets.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-3)', fontSize: 13.5 }}>
            No budgets set yet. Add one above!
          </div>
        ) : budgets.map((b, idx) => {
          const pct = Math.min(b.percentage, 100)
          const isOver = b.percentage >= 100
          const isWarn = b.percentage >= 80 && !isOver
          const barColor = isOver ? 'var(--red)' : isWarn ? 'var(--amber)' : 'var(--green)'
          return (
            <div key={b.id} className={`card animate-fade-up-${Math.min(idx + 1, 4)}`} style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{CAT_ICONS[b.category] || '📦'}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text)' }}>{b.category}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 1 }}>{b.percentage}% used</div>
                  </div>
                  {isOver && <span className="badge badge-red"><AlertTriangle size={10} /> Over budget</span>}
                  {isWarn && <span className="badge badge-amber">Near limit</span>}
                  {!isOver && !isWarn && b.percentage > 0 && <span className="badge badge-green"><CheckCircle size={10} /> On track</span>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{fmt(b.spent)}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 1 }}>of {fmt(b.monthlyLimit)}</div>
                </div>
              </div>
              <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 3, transition: 'width 0.6s ease' }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
