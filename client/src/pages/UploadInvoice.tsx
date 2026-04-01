import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Sparkles, CheckCircle, AlertCircle, FileText, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'

const CATEGORIES = ['Food', 'Travel', 'Software', 'Office', 'Marketing', 'Utilities', 'Other']

export default function UploadInvoice() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [extracted, setExtracted] = useState<any>(null)
  const [form, setForm] = useState<any>({})
  const [dragOver, setDragOver] = useState(false)
  const navigate = useNavigate()

  const setFileAndPreview = (f: File) => {
    setFile(f)
    if (f.type.startsWith('image/')) setPreview(URL.createObjectURL(f))
    else setPreview(null)
    setExtracted(null); setForm({})
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) setFileAndPreview(f)
  }, [])

  const extractWithAI = async () => {
    if (!file) return
    setExtracting(true)
    try {
      const fd = new FormData(); fd.append('invoice', file)
      const { data } = await api.post('/invoices/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setExtracted(data.extracted)
      setForm({
        vendorName: data.extracted.vendorName || '',
        invoiceDate: data.extracted.invoiceDate || '',
        dueDate: data.extracted.dueDate || '',
        totalAmount: data.extracted.totalAmount || '',
        currency: data.extracted.currency || 'INR',
        category: data.extracted.category || 'Other',
        status: 'unpaid',
        confidence: data.extracted.confidence || 0,
        lineItems: data.extracted.lineItems || [],
      })
      toast.success('AI extraction complete!')
    } catch {
      toast.error('Extraction failed — fill details manually')
      setForm({ vendorName: '', invoiceDate: '', dueDate: '', totalAmount: '', currency: 'INR', category: 'Other', status: 'unpaid' })
    } finally { setExtracting(false) }
  }

  const saveInvoice = async () => {
    setSaving(true)
    try {
      await api.post('/invoices', form)
      toast.success('Invoice saved!')
      navigate('/invoices')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally { setSaving(false) }
  }

  const f = (field: string) => ({ value: form[field] ?? '', onChange: (e: any) => setForm({ ...form, [field]: e.target.value }) })

  return (
    <div className="animate-fade-up" style={{ maxWidth: 860 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px', marginBottom: 4 }}>Upload Invoice</h1>
        <p style={{ color: 'var(--text-3)', fontSize: 13.5 }}>GPT-4o Vision extracts all details automatically</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Upload side */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div
            onDrop={onDrop}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => !file && document.getElementById('file-input')?.click()}
            className="card"
            style={{
              padding: 28, textAlign: 'center', cursor: file ? 'default' : 'pointer',
              border: `1px solid ${dragOver ? 'var(--green)' : file ? 'var(--border)' : 'var(--border)'}`,
              background: dragOver ? 'var(--green-dim)' : 'var(--surface)',
              transition: 'all 0.2s', minHeight: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}>
            <input id="file-input" type="file" accept="image/*,application/pdf" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) setFileAndPreview(f) }} />

            {file ? (
              <>
                {preview ? (
                  <img src={preview} alt="preview" style={{ maxHeight: 160, maxWidth: '100%', borderRadius: 8, objectFit: 'contain', marginBottom: 12 }} />
                ) : (
                  <div style={{ width: 56, height: 56, borderRadius: 12, background: 'var(--blue-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    <FileText size={24} color="var(--blue)" />
                  </div>
                )}
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{file.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12 }}>{(file.size / 1024).toFixed(1)} KB</div>
                <button onClick={e => { e.stopPropagation(); setFile(null); setPreview(null); setExtracted(null); setForm({}) }}
                  style={{ fontSize: 12, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <X size={12} /> Remove file
                </button>
              </>
            ) : (
              <>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: 'var(--surface-2)', border: '1px dashed var(--border-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Upload size={22} color="var(--text-3)" />
                </div>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 5 }}>Drop invoice here</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-3)' }}>or <span style={{ color: 'var(--green)' }}>click to browse</span></div>
                <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 8 }}>JPG, PNG, PDF supported</div>
              </>
            )}
          </div>

          {file && !extracted && (
            <button onClick={extractWithAI} disabled={extracting} className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px 18px' }}>
              <Sparkles size={15} />
              {extracting ? 'Extracting with AI...' : 'Extract with AI (GPT-4o)'}
            </button>
          )}

          {extracting && (
            <div className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--green-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Sparkles size={15} color="var(--green)" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>GPT-4o is reading your invoice</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Extracting vendor, amounts, line items...</div>
              </div>
              <div style={{ marginLeft: 'auto', width: 18, height: 18, border: '2px solid var(--green)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            </div>
          )}

          {extracted && (
            <div className="card" style={{ padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <CheckCircle size={16} color="var(--green)" />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>AI Extraction Complete</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, padding: '8px 12px', background: 'var(--surface-2)', borderRadius: 7, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 10.5, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Confidence</div>
                  <div style={{ fontSize: 16, fontFamily: "'DM Mono', monospace", color: extracted.confidence > 0.8 ? 'var(--green)' : 'var(--amber)', fontWeight: 500 }}>
                    {Math.round((extracted.confidence || 0) * 100)}%
                  </div>
                </div>
                <div style={{ flex: 1, padding: '8px 12px', background: 'var(--surface-2)', borderRadius: 7, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 10.5, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Line Items</div>
                  <div style={{ fontSize: 16, fontFamily: "'DM Mono', monospace", color: 'var(--blue)', fontWeight: 500 }}>{extracted.lineItems?.length || 0}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form side */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 18 }}>Invoice Details</div>

          {!file && (
            <div style={{ display: 'flex', gap: 10, padding: '12px 14px', background: 'var(--blue-dim)', border: '1px solid #4f8ef730', borderRadius: 8, marginBottom: 16 }}>
              <AlertCircle size={14} color="var(--blue)" style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 12.5, color: 'var(--blue)', lineHeight: 1.5 }}>Upload an invoice to use AI extraction, or fill details manually</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-3)', display: 'block', marginBottom: 5 }}>Vendor Name *</label>
              <input {...f('vendorName')} className="input" style={{ fontSize: 13 }} placeholder="e.g. AWS, Zomato" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-3)', display: 'block', marginBottom: 5 }}>Invoice Date *</label>
                <input type="date" {...f('invoiceDate')} className="input" style={{ fontSize: 13 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-3)', display: 'block', marginBottom: 5 }}>Due Date</label>
                <input type="date" {...f('dueDate')} className="input" style={{ fontSize: 13 }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-3)', display: 'block', marginBottom: 5 }}>Amount *</label>
                <input type="number" {...f('totalAmount')} className="input" style={{ fontSize: 13 }} placeholder="0.00" />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-3)', display: 'block', marginBottom: 5 }}>Currency</label>
                <select {...f('currency')} className="input" style={{ fontSize: 13 }}>
                  {['INR', 'USD', 'EUR', 'GBP'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-3)', display: 'block', marginBottom: 5 }}>Category</label>
                <select {...f('category')} className="input" style={{ fontSize: 13 }}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-3)', display: 'block', marginBottom: 5 }}>Status</label>
                <select {...f('status')} className="input" style={{ fontSize: 13 }}>
                  {['unpaid', 'paid', 'overdue'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <button onClick={saveInvoice}
              disabled={saving || !form.vendorName || !form.totalAmount || !form.invoiceDate}
              className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px 18px', marginTop: 4 }}>
              {saving ? 'Saving...' : 'Save Invoice'}
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
