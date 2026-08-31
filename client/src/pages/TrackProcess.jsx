import { useState } from 'react'
import { Search, Loader2, ArrowLeft, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

const STATUS_INFO = {
  new: { label: 'Received', color: 'text-emerald-400', icon: CheckCircle2 },
  'in-progress': { label: 'In Progress', color: 'text-blue-400', icon: Clock },
  completed: { label: 'Completed', color: 'text-white', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'text-red-400', icon: AlertCircle },
  read: { label: 'Under Review', color: 'text-k-silver-dim', icon: Clock }
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function TrackProcess() {
  const [trackingId, setTrackingId] = useState('')
  const [loading, setLoading] = useState(false)
  const [processData, setProcessData] = useState(null)
  const [error, setError] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!trackingId.trim()) return

    setLoading(true)
    setError(null)
    setProcessData(null)

    // Use Express backend to retrieve status securely
    try {
      const res = await fetch(`${API_URL}/contact/track/${encodeURIComponent(trackingId.trim())}`)
      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error || "We couldn't find a process with that ID.")
      }
      
      setProcessData(json.data)
    } catch (err) {
      setError("We couldn't find a process with that ID. Please check and try again.")
    } finally {
      setLoading(false)
    }
    setLoading(false)
  }

  return (
    <section className="section-padding relative min-h-[80vh] flex flex-col justify-center">
      <div className="max-w-3xl mx-auto w-full">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-k-silver-dim hover:text-white transition-colors">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>

        <div className="text-center mb-12">
          <span className="text-xs font-body text-k-silver-dim uppercase tracking-[0.3em]">Client Portal</span>
          <h1 className="section-title font-display text-3xl md:text-5xl font-bold mt-4 text-white">
            Track Your Process
          </h1>
          <p className="mt-4 text-k-silver-dim font-body max-w-xl mx-auto">
            Enter your unique Tracking ID below to view the current status of your request, project, or inquiry.
          </p>
        </div>

        <div className="glass-card p-6 md:p-8">
          <form onSubmit={handleSearch} className="flex gap-4 mb-8">
            <div className="relative flex-1">
              <Search size={18} className="absolute top-4 left-5 text-k-silver-dim" />
              <input
                type="text"
                placeholder="e.g. KRX-A1B2C3"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-k-dark border border-k-border rounded-xl text-base text-white placeholder:text-k-silver-dim/50 focus:outline-none focus:border-white/20 transition-all font-mono"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || !trackingId.trim()}
              className="btn-primary whitespace-nowrap disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Track Status'}
            </button>
          </form>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {processData && (
            <div className="mt-8 pt-8 border-t border-k-border animate-fade-in">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                  <h2 className="text-xl font-display font-bold text-white mb-2">Project Request</h2>
                  <p className="text-sm text-k-silver-dim font-mono tracking-wide">ID: {processData.trackingId}</p>
                </div>
                
                {(() => {
                  const statusObj = STATUS_INFO[processData.status] || STATUS_INFO.new
                  const StatusIcon = statusObj.icon
                  return (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border border-k-border bg-k-dark ${statusObj.color}`}>
                      <StatusIcon size={16} />
                      <span className="text-sm font-semibold tracking-wider uppercase">{statusObj.label}</span>
                    </div>
                  )
                })()}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-k-dark rounded-xl p-5 border border-k-border">
                  <p className="text-xs text-k-silver-dim uppercase tracking-wider mb-2">Date Submitted</p>
                  <p className="text-white text-sm">
                    {new Date(processData.createdAt).toLocaleDateString('en-US', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="bg-k-dark rounded-xl p-5 border border-k-border">
                  <p className="text-xs text-k-silver-dim uppercase tracking-wider mb-2">Submitted By</p>
                  <p className="text-white text-sm">{processData.name}</p>
                  <p className="text-k-silver-dim text-xs mt-1">{processData.email}</p>
                </div>
              </div>

              <div className="mt-6 bg-k-dark rounded-xl p-6 border border-k-border">
                <p className="text-xs text-k-silver-dim uppercase tracking-wider mb-4">Request Details</p>
                <div className="text-sm text-white leading-relaxed whitespace-pre-wrap">
                  {(() => {
                    let message = processData.message || '';
                    let file_url = null;
                    const attachmentMatch = message.match(/\[ATTACHMENT\]:\s*(https?:\/\/[^\s]+)/);
                    if (attachmentMatch) {
                      file_url = attachmentMatch[1];
                      message = message.replace(/\n\n\[ATTACHMENT\]:\s*https?:\/\/[^\s]+/, '');
                    }
                    
                    return (
                      <>
                        <p>{message}</p>
                        {file_url && (
                          <div className="mt-6 pt-4 border-t border-k-border/50">
                            <p className="text-xs text-k-silver-dim uppercase tracking-wider mb-2">Attached Reference File</p>
                            <a 
                              href={file_url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm transition-colors"
                            >
                              <CheckCircle2 size={14} />
                              View Attachment
                            </a>
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
