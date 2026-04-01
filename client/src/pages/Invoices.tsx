import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Upload, Download, Trash2, Search, Filter, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'

const CATEGORIES = ['', 'Food', 'Travel', 'Software', 'Office', 'Marketing', 'Utilities', 'Other']
const STATUSES   = ['', 'paid', 'unpaid', 'overdue']

const badgeClass: Record<string, string> = {
  paid: 'badge badge-green', unpaid: 'badge badge-amber', overdue: 'badge badge-red'
}

function SkeletonRow() {
  return (
    <tr>
      {[...Array(7)].map((_, i) => (
        <td key={i} style={{ padding: '14px 16px' }}>
          <div className="skeleton" style={{ height: 12, width: i === 0 ? '80%' : i === 4 ? '60%' : '70%' }} />
        </td>
      ))}
    </tr>
  )
}

export default function Invoices() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ category: '', status: '', search: '', dateFrom: '', dateTo: '' })

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
      const { data } = await api.get('/invoices', { params })
      setInvoices(data)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchInvoices() }, [filters])

  const deleteInvoice = async (id: number) => {
    if (!confirm('Delete this invoice?')) return
    await api.delete(`/invoices/${id}`)
    toast.success('Invoice deleted')
    fetchInvoices()
  }

  const exportCSV = async () => {
    const res = await api.get('/invoices/export/csv', { responseType: 'blob' })
    const url = URL.createObjectURL(new Blob([res.data]))
    const a = document.createElement('a'); a.href = url; a.download = 'invoices.csv'; a.click()
    toast.success('CSV exported')
  }

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
  const totalShown = invoices.reduce((s, i) => s + i.totalAmount, 0)

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px', marginBottom: 4 }}>Invoices</h1>
          <p style={{ color: 'var(--text-3)', fontSize: 13.5 }}>
            {loading ? '...' : `${invoices.length} invoices · ${fmt(totalShown)} total`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={exportCSV} className="btn-secondary"><Download size={14} /> Export CSV</button>
          <Link to="/invoices/upload" className="btn-primary"><Upload size={14} /> Upload Invoice</Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '14px 16px', marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 180px' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input placeholder="Search vendor..." value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value })}
            className="input" style={{ paddingLeft: 30, fontSize: 13 }} />
        </div>
        <select value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}
          className="input" style={{ flex: '0 0 140px', fontSize: 13 }}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c || 'All Categories'}</option>)}
        </select>
        <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}
          className="input" style={{ flex: '0 0 130px', fontSize: 13 }}>
          {STATUSES.map(s => <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Status'}</option>)}
        </select>
        <input type="date" value={filters.dateFrom} onChange={e => setFilters({ ...filters, dateFrom: e.target.value })}
          className="input" style={{ flex: '0 0 140px', fontSize: 13 }} />
        <input type="date" value={filters.dateTo} onChange={e => setFilters({ ...filters, dateTo: e.target.value })}
          className="input" style={{ flex: '0 0 140px', fontSize: 13 }} />
        {(filters.category || filters.status || filters.search || filters.dateFrom || filters.dateTo) && (
          <button onClick={() => setFilters({ category: '', status: '', search: '', dateFrom: '', dateTo: '' })}
            style={{ fontSize: 12, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', flexShrink: 0 }}>
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Vendor', 'Invoice Date', 'Due Date', 'Category', 'Amount', 'Status', ''].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '11px 16px', fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? [...Array(6)].map((_, i) => <SkeletonRow key={i} />) :
             invoices.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13.5 }}>
                No invoices found. <Link to="/invoices/upload" style={{ color: 'var(--green)', textDecoration: 'none' }}>Upload one →</Link>
              </td></tr>
            ) : invoices.map(inv => (
              <tr key={inv.id} className="table-row">
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--text)' }}>{inv.vendorName}</div>
                  {inv.confidence && (
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                      <span style={{ color: inv.confidence > 0.8 ? 'var(--green)' : inv.confidence > 0.6 ? 'var(--amber)' : 'var(--red)' }}>●</span>
                      {' '}{Math.round(inv.confidence * 100)}% AI confidence
                    </div>
                  )}
                </td>
                <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--text-2)' }}>
                  {new Date(inv.invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td style={{ padding: '13px 16px', fontSize: 13, color: 'var(--text-2)' }}>
                  {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <span className="badge badge-gray">{inv.category}</span>
                </td>
                <td style={{ padding: '13px 16px', fontFamily: "'DM Mono', monospace", fontSize: 13.5, color: 'var(--text)', fontWeight: 500 }}>
                  {inv.currency} {fmt(inv.totalAmount)}
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <span className={badgeClass[inv.status] || 'badge badge-gray'}>{inv.status}</span>
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <button onClick={() => deleteInvoice(inv.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4, borderRadius: 5, transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
