import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import { TrendingUp, FileText, Clock, AlertTriangle, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

const COLORS = ['#00d97e', '#4f8ef7', '#f5a623', '#f04444', '#a78bfa', '#ec4899']

interface Summary {
  totalSpend: number; thisMonth: number; pending: number; overdue: number
  monthlyTrend: { month: string; amount: number }[]
  categoryData: { name: string; value: number }[]
}

function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div className="skeleton" style={{ height: 12, width: '40%', marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 28, width: '60%', marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 10, width: '30%' }} />
    </div>
  )
}

function StatCard({ label, value, sub, icon: Icon, color, delay }: any) {
  return (
    <div className={`card animate-fade-up-${delay}`} style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>{label}</div>
          <div className="stat-number">{value}</div>
          {sub && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>{sub}</div>}
        </div>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={16} color={color} />
        </div>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
      <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--green)', fontFamily: "'DM Mono', monospace" }}>
        ₹{Number(payload[0].value).toLocaleString('en-IN')}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    api.get('/dashboard/summary').then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  const fmt = (n: number) => `₹${n >= 100000 ? (n / 100000).toFixed(1) + 'L' : n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

  return (
    <div>
      {/* Header */}
      <div className="animate-fade-up" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px', marginBottom: 4 }}>
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ color: 'var(--text-3)', fontSize: 13.5 }}>Here's your expense overview for today</p>
          </div>
          <Link to="/invoices/upload" className="btn-primary">
            <ArrowUpRight size={14} /> Upload Invoice
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          <StatCard delay={1} label="Total Spend" value={fmt(data!.totalSpend)} sub="All time" icon={TrendingUp} color="var(--green)" />
          <StatCard delay={2} label="This Month" value={fmt(data!.thisMonth)} sub={new Date().toLocaleString('default', { month: 'long' })} icon={FileText} color="var(--blue)" />
          <StatCard delay={3} label="Pending" value={data!.pending} sub="unpaid invoices" icon={Clock} color="var(--amber)" />
          <StatCard delay={4} label="Overdue" value={data!.overdue} sub="need attention" icon={AlertTriangle} color="var(--red)" />
        </div>
      )}

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 14 }}>
        {/* Area chart */}
        <div className="card animate-fade-up-2" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>Spending Trend</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Last 6 months</div>
            </div>
          </div>
          {loading ? <div className="skeleton" style={{ height: 200 }} /> : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data?.monthlyTrend || []} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d97e" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#00d97e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} width={48} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="amount" stroke="#00d97e" strokeWidth={2} fill="url(#greenGrad)" dot={{ fill: '#00d97e', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#00d97e' }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart */}
        <div className="card animate-fade-up-3" style={{ padding: 24 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>By Category</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 18 }}>Spend distribution</div>
          {loading ? <div className="skeleton" style={{ height: 200 }} /> : data?.categoryData.length === 0 ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 13 }}>No data yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={data?.categoryData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3}>
                    {data?.categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} strokeWidth={0} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Amount']} contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                {data?.categoryData.slice(0, 4).map(({ name, value }, i) => (
                  <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{name}</span>
                    </div>
                    <span style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: 'var(--text)' }}>₹{value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
