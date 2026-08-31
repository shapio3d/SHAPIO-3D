import { useState } from 'react'
import { Search, Loader2, ArrowLeft, CheckCircle2, Clock, AlertCircle, Image, X } from 'lucide-react'
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
                  <p>{(processData.message || '').replace(/\n\n\[ATTACHMENT\]:\s*\S+/, '')}</p>
                </div>
              </div>

              {/* Attachment Image Preview */}
              {processData.fileUrl && (
                <div className="mt-6 bg-k-dark rounded-xl p-6 border border-k-border">
                  <p className="text-xs text-k-silver-dim uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Image size={14} />
                    Attached Reference
                  </p>
                  <div 
                    className="relative group cursor-pointer rounded-lg overflow-hidden border border-k-border/50 hover:border-emerald-500/50 transition-all"
                    onClick={() => window.open(processData.fileUrl, '_blank')}
                  >
                    <img 
                      src={processData.fileUrl} 
                      alt="Reference attachment" 
                      className="w-full max-h-[300px] object-contain bg-black/50"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.parentElement.innerHTML = '<div class="p-8 text-center text-k-silver-dim text-sm">Preview not available — <a href="' + processData.fileUrl + '" target="_blank" class="text-emerald-400 underline">Download file</a></div>'
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white text-xs font-semibold tracking-wider">
                        CLICK TO VIEW FULL SIZE
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* WhatsApp Fallback */}
              <div className="mt-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                <p className="text-sm text-emerald-400 mb-4">Have questions about your project status?</p>
                <a 
                  href={`https://wa.me/916384014546?text=Hi,%20I%20have%20a%20question%20about%20my%20project%20status.%20Tracking%20ID:%20${processData.trackingId}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-lg font-medium hover:bg-[#128C7E] transition-colors text-sm shadow-[0_0_20px_rgba(37,211,102,0.2)]"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.893-4.448 9.893-9.892 0-5.447-4.446-9.892-9.893-9.892-5.452 0-9.894 4.449-9.894 9.892 0 1.988.546 3.779 1.595 5.24l-1.105 4.025 4.012-1.065zm1.536-7.859c-.482-.962-.992-.98-1.449-.997-.433-.016-.928-.016-1.409-.016-.481 0-1.261.18-1.921.899-.661.719-2.522 2.464-2.522 6.002 0 3.538 2.582 6.956 2.943 7.436.36.48 5.068 7.741 12.28 10.852 1.715.74 3.056 1.182 4.1 1.512 1.719.544 3.284.467 4.516.284 1.378-.205 4.24-1.734 4.84-3.414.601-1.68.601-3.123.421-3.422-.18-.299-.662-.48-1.383-.84-7.22-3.606-4.24-2.12-4.901-2.42-6.61-.3-.1.42-.599 1.14-1.449 1.44-2.121 1.56-.299.18-3.963-1.895-7.535-6.04-1.018-1.18-.838-1.18.299-1.921l1.08-1.259c.3-.36.42-.6.599-1.018.18-.42.09-.78-.06-1.14-.15-.36-1.449-3.486-1.985-4.773z" fillRule="evenodd"/></svg>
                  Ask on WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
