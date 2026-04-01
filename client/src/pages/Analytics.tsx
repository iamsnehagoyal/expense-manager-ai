import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts'
import api from '../lib/api'

const COLORS = ['#00d97e', '#4f8ef7', '#f5a623', '#f04444', '#a78bfa', '#ec4899']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
      <div style={{ fontSize: 11.5, color: 'var(--text-2)', marginBottom: 6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ fontSize: 13, color: p.color, fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>
          ₹{Number(p.value).toLocaleString('en-IN')}
        </div>
      ))}
    </div>
  )
}

export default function Analytics() {
  const [data, setData] = useState<any>(null)
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/summary'),
      api.get('/invoices')
    ]).then(([s, i]) => {
      setData(s.data)
      setInvoices(i.data)
    }).finally(() => setLoading(false))
  }, [])

  // Build category × month matrix
  const buildCategoryTrend = () => {
    if (!invoices.length) return []
    const months: Record<string, Record<string, number>> = {}
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = d.toLocaleString('default', { month: 'short', year: '2-digit' })
      months[key] = {}
    }
    invoices.forEach(inv => {
      const d = new Date(inv.invoiceDate)
      const key = d.toLocaleString('default', { month: 'short', year: '2-digit' })
      if (months[key] !== undefined) {
        months[key][inv.category] = (months[key][inv.category] || 0) + inv.totalAmount
      }
    })
    return Object.entries(months).map(([month, cats]) => ({ month, ...cats }))
  }

  const categoryTrend = buildCategoryTrend()
  const allCategories = [...new Set(invoices.map(i => i.category))]

  // Top vendors
  const vendorMap: Record<string, number> = {}
  invoices.forEach(i => { vendorMap[i.vendorName] = (vendorMap[i.vendorName] || 0) + i.totalAmount })
  const topVendors = Object.entries(vendorMap).sort((a, b) => b[1] - a[1]).slice(0, 8)
    .map(([name, value]) => ({ name, value }))

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

  // Paid vs unpaid
  const paid   = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.totalAmount, 0)
  const unpaid = invoices.filter(i => i.status === 'unpaid').reduce((s, i) => s + i.totalAmount, 0)
  const total  = paid + unpaid || 1

  return (
    <div className="animate-fade-up">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px', marginBottom: 4 }}>Analytics</h1>
        <p style={{ color: 'var(--text-3)', fontSize: 13.5 }}>Deep dive into your spending patterns</p>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Avg Invoice Value', value: invoices.length ? fmt(invoices.reduce((s, i) => s + i.totalAmount, 0) / invoices.length) : '₹0' },
          { label: 'Payment Rate', value: `${total > 1 ? Math.round((paid / total) * 100) : 0}%` },
          { label: 'Total Invoices', value: invoices.length.toString() },
        ].map(({ label, value }, i) => (
          <div key={label} className={`card animate-fade-up-${i + 1}`} style={{ padding: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{label}</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 24, fontWeight: 500, color: 'var(--text)' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Paid vs Unpaid bar */}
      <div className="card animate-fade-up-2" style={{ padding: 18, marginBottom: 14 }}>
        <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text)', marginBottom: 10 }}>Paid vs Unpaid</div>
        <div style={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 10 }}>
          <div style={{ width: `${(paid / total) * 100}%`, background: 'var(--green)', transition: 'width 0.6s ease' }} />
          <div style={{ flex: 1, background: 'var(--amber)' }} />
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--green)' }} />
            <span style={{ fontSize: 12.5, color: 'var(--text-2)' }}>Paid: <strong style={{ color: 'var(--text)' }}>{fmt(paid)}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--amber)' }} />
            <span style={{ fontSize: 12.5, color: 'var(--text-2)' }}>Unpaid: <strong style={{ color: 'var(--text)' }}>{fmt(unpaid)}</strong></span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        {/* Category trend */}
        <div className="card animate-fade-up-3" style={{ padding: 22 }}>
          <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text)', marginBottom: 4 }}>Category Trend</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 18 }}>Monthly spend by category</div>
          {loading ? <div className="skeleton" style={{ height: 200 }} /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryTrend} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} width={42} />
                <Tooltip content={<CustomTooltip />} />
                {allCategories.map((cat, i) => (
                  <Bar key={cat} dataKey={cat} stackId="a" fill={COLORS[i % COLORS.length]} radius={i === allCategories.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top vendors */}
        <div className="card animate-fade-up-4" style={{ padding: 22 }}>
          <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text)', marginBottom: 4 }}>Top Vendors</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 18 }}>By total spend</div>
          {loading ? <div className="skeleton" style={{ height: 200 }} /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topVendors.map(({ name, value }, i) => {
                const pct = (value / (topVendors[0]?.value || 1)) * 100
                return (
                  <div key={name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 12.5, color: 'var(--text-2)', fontWeight: 500 }}>{name}</span>
                      <span style={{ fontSize: 12.5, fontFamily: "'DM Mono', monospace", color: 'var(--text)' }}>{fmt(value)}</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--surface-2)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: COLORS[i % COLORS.length], borderRadius: 2, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                )
              })}
              {topVendors.length === 0 && <div style={{ color: 'var(--text-3)', fontSize: 13, paddingTop: 20, textAlign: 'center' }}>No data yet</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
