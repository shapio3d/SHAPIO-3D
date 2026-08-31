import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Key, Shield, CheckCircle, FileText } from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function Settings() {
  const { admin } = useAuth()
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  
  // PDF Settings State
  const [pdfSettings, setPdfSettings] = useState({
    companyName: "Shapio 3D Technologies",
    companyAddress: "No. 216, Indira Nagar, Ammanapakkam,\nChengalpattu – 603003, Tamil Nadu, India",
    gstin: "33QLBPS8301A1ZC",
    pan: "QLBPS8301A",
    email: "shapio3dtech@gmail.com",
    accountName: "SHAPIO 3D TECHNOLOGIES",
    accountNumber: "0457073000000458",
    ifsc: "SIBL0000457",
    branch: "SOUTH INDIAN BANK, CHENGALPATTU BRANCH - KANCHIPURAM"
  })

  const [saved, setSaved] = useState(false)
  const [pdfSaved, setPdfSaved] = useState(false)
  const [error, setError] = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)

  useEffect(() => {
    fetchPdfSettings()
  }, [])

  const fetchPdfSettings = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/settings`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPdfSettings({ ...pdfSettings, ...data });
      }
    } catch (err) {
      console.error(err);
    }
  }

  const handlePdfSubmit = async (e) => {
    e.preventDefault()
    setPdfLoading(true)
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/settings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pdfSettings)
      });
      if (res.ok) {
        setPdfSaved(true)
        setTimeout(() => setPdfSaved(false), 3000)
      }
    } catch (err) {
      console.error(err);
    }
    
    setPdfLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError('All fields are required')
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match')
      return
    }
    if (form.newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    // Mock save
    await new Promise(resolve => setTimeout(resolve, 800))
    setSaved(true)
    setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-white tracking-wide">Settings</h1>
        <p className="text-sm text-k-silver-dim mt-1">Manage your account settings</p>
      </div>

      <div className="max-w-xl">
        {/* Account info */}
        <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-k-silver/20 to-k-border flex items-center justify-center">
              <span className="font-display text-lg font-bold text-k-silver">
                {admin?.username?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{admin?.email || 'Administrator'}</p>
              <p className="text-xs text-k-silver-dim mt-0.5">Administrator</p>
            </div>
          </div>
        </div>



        {/* PDF Defaults config */}
        <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6 mt-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-k-card border border-white/10 flex items-center justify-center">
              <FileText size={18} className="text-k-silver" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Invoice PDF Defaults</h3>
              <p className="text-xs text-k-silver-dim">Configure company details shown on generated invoices</p>
            </div>
          </div>

          <form onSubmit={handlePdfSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-k-silver-dim uppercase tracking-wider mb-1.5">Company Name</label>
                <input value={pdfSettings.companyName} onChange={e => setPdfSettings({...pdfSettings, companyName: e.target.value})} className="w-full px-4 py-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-k-silver/40 transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-k-silver-dim uppercase tracking-wider mb-1.5">Email</label>
                <input value={pdfSettings.email} onChange={e => setPdfSettings({...pdfSettings, email: e.target.value})} className="w-full px-4 py-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-k-silver/40 transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-k-silver-dim uppercase tracking-wider mb-1.5">Company Address</label>
              <textarea value={pdfSettings.companyAddress} onChange={e => setPdfSettings({...pdfSettings, companyAddress: e.target.value})} rows={2} className="w-full px-4 py-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-k-silver/40 transition-colors resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-k-silver-dim uppercase tracking-wider mb-1.5">GSTIN</label>
                <input value={pdfSettings.gstin} onChange={e => setPdfSettings({...pdfSettings, gstin: e.target.value})} className="w-full px-4 py-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-k-silver/40 transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-k-silver-dim uppercase tracking-wider mb-1.5">PAN</label>
                <input value={pdfSettings.pan} onChange={e => setPdfSettings({...pdfSettings, pan: e.target.value})} className="w-full px-4 py-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-k-silver/40 transition-colors" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-k-silver-dim uppercase tracking-wider mb-1.5">Bank Account Name</label>
                <input value={pdfSettings.accountName} onChange={e => setPdfSettings({...pdfSettings, accountName: e.target.value})} className="w-full px-4 py-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-k-silver/40 transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-k-silver-dim uppercase tracking-wider mb-1.5">Account Number</label>
                <input value={pdfSettings.accountNumber} onChange={e => setPdfSettings({...pdfSettings, accountNumber: e.target.value})} className="w-full px-4 py-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-k-silver/40 transition-colors" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-k-silver-dim uppercase tracking-wider mb-1.5">IFSC Code</label>
                <input value={pdfSettings.ifsc} onChange={e => setPdfSettings({...pdfSettings, ifsc: e.target.value})} className="w-full px-4 py-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-k-silver/40 transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-k-silver-dim uppercase tracking-wider mb-1.5">Branch</label>
                <input value={pdfSettings.branch} onChange={e => setPdfSettings({...pdfSettings, branch: e.target.value})} className="w-full px-4 py-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-k-silver/40 transition-colors" />
              </div>
            </div>

            {pdfSaved && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 text-sm text-emerald-400">
                <CheckCircle size={16} />
                PDF Settings updated successfully
              </div>
            )}

            <button
              type="submit"
              disabled={pdfLoading}
              className="px-6 py-2.5 bg-gradient-to-r from-white to-k-silver text-k-black text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-white/10 transition-all disabled:opacity-50"
            >
              {pdfLoading ? 'Saving...' : 'Save PDF Settings'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
