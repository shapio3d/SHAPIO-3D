import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Search, Eye, X, Image as ImageIcon, CheckCircle, Trash2, Calendar, User, Mail, Phone, Hash } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeader = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Authorization': `Bearer ${session?.access_token}`,
    'Content-Type': 'application/json'
  };
}

export default function ContactSubmissions() {
  const [submissions, setSubmissions] = useState([])
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [viewing, setViewing] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    setLoading(true)
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/contact/admin`, { headers });
      if (!res.ok) throw new Error('Failed to fetch submissions');
      const data = await res.json();
      
      // Extract file URL from message if present
      const processedData = data.map(sub => {
        let message = sub.message || ''
        let file_url = sub.fileUrl || null // Fallback if they ever add the column
        
        const attachmentMatch = message.match(/\[ATTACHMENT\]:\s*(https?:\/\/[^\s]+|\/uploads\/[^\s]+)/)
        if (attachmentMatch) {
          file_url = attachmentMatch[1]
          if (file_url.startsWith('/uploads')) {
            const baseUrl = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL;
            file_url = `${baseUrl}${file_url}`;
          }
          message = message.replace(/\n\n\[ATTACHMENT\]:\s*(https?:\/\/[^\s]+|\/uploads\/[^\s]+)/, '')
        }
        
        return { ...sub, message, file_url }
      })
      
      setSubmissions(processedData)
    } catch (error) {
      console.error(error);
    }
    setLoading(false)
  }

  const filtered = submissions.filter(sub => 
    (sub.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (sub.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (sub.trackingId || '').toLowerCase().includes(search.toLowerCase())
  )

  const openView = (submission) => {
    setViewing(submission)
    setModalOpen(true)
  }

  const updateStatus = async (id, status) => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/contact/admin/${id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update status');
      
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status } : s))
      if (viewing?.id === id) {
        setViewing({ ...viewing, status })
      }
    } catch (error) {
      console.error(error);
    }
  }

  const handleDelete = async (id) => {
    if(!window.confirm('Are you sure you want to delete this submission?')) return;
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/contact/admin/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!res.ok) throw new Error('Failed to delete submission');
      
      setSubmissions(prev => prev.filter(s => s.id !== id))
      if (viewing?.id === id) setModalOpen(false)
    } catch (error) {
      console.error(error);
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'in_progress': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      default: return 'bg-k-silver-dim/10 text-k-silver-dim border-k-silver-dim/20'
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-white tracking-wide">Contact Submissions</h1>
          <p className="text-sm text-k-silver-dim mt-1">{submissions.length} total inquiries</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute top-3.5 left-4 text-k-silver-dim" />
        <input
          type="text"
          placeholder="Search by name, email, or tracking ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-md pl-11 pr-4 py-3 bg-black/20 backdrop-blur-md border border-white/10 rounded-xl text-sm text-white placeholder:text-k-silver-dim/40 focus:outline-none focus:border-k-silver/40 transition-colors"
        />
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-black/20 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-4 text-[11px] text-k-silver-dim uppercase tracking-wider font-medium">Tracking ID</th>
                <th className="text-left px-6 py-4 text-[11px] text-k-silver-dim uppercase tracking-wider font-medium">Customer</th>
                <th className="text-left px-6 py-4 text-[11px] text-k-silver-dim uppercase tracking-wider font-medium">Date</th>
                <th className="text-left px-6 py-4 text-[11px] text-k-silver-dim uppercase tracking-wider font-medium">Status</th>
                <th className="text-left px-6 py-4 text-[11px] text-k-silver-dim uppercase tracking-wider font-medium">Attachment</th>
                <th className="text-right px-6 py-4 text-[11px] text-k-silver-dim uppercase tracking-wider font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sub) => (
                <tr key={sub.id} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-white bg-white/5 px-2 py-1 rounded">{sub.trackingId}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-k-silver/20 to-k-border flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-k-silver">{sub.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{sub.name}</p>
                        <p className="text-xs text-k-silver-dim">{sub.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-k-silver-dim">
                    {new Date(sub.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full border ${getStatusColor(sub.status)}`}>
                      {sub.status || 'new'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {sub.file_url ? (
                      <div className="flex items-center gap-2 text-emerald-400 text-xs">
                        <ImageIcon size={14} />
                        <span>Included</span>
                      </div>
                    ) : (
                      <span className="text-xs text-k-silver-dim">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openView(sub)} className="w-8 h-8 rounded-lg flex items-center justify-center text-k-silver-dim hover:text-white hover:bg-white/[0.06] transition-all">
                        <Eye size={14} />
                      </button>
                      <button onClick={() => handleDelete(sub.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-k-silver-dim hover:text-red-400 hover:bg-red-400/[0.06] transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-k-silver-dim text-sm">
                    No submissions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-4">
        {filtered.map((sub) => (
          <div key={sub.id} className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-4 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-k-silver/20 to-k-border flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-k-silver">{sub.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{sub.name}</p>
                  <p className="text-xs text-k-silver-dim">{sub.email}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-2">
               <div>
                  <span className="font-mono text-[10px] font-bold text-white bg-white/5 px-2 py-1 rounded">{sub.trackingId}</span>
               </div>
               <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full border ${getStatusColor(sub.status)}`}>
                 {sub.status || 'new'}
               </span>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <div>
                <p className="text-[10px] text-k-silver-dim uppercase tracking-wider mb-1">Attachment</p>
                {sub.file_url ? (
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
                    <ImageIcon size={14} /> <span>Included</span>
                  </div>
                ) : (
                  <span className="text-xs text-k-silver-dim">—</span>
                )}
              </div>
              <div className="text-right">
                <p className="text-[10px] text-k-silver-dim uppercase tracking-wider mb-1">Date</p>
                <p className="text-sm text-white">{new Date(sub.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
              <button onClick={() => openView(sub)} className="flex-1 py-2 rounded-lg flex items-center justify-center gap-2 bg-white/5 text-k-silver-dim hover:text-white hover:bg-white/10 transition-all text-sm">
                <Eye size={14} /> <span className="hidden sm:inline">View</span>
              </button>
              <button onClick={() => handleDelete(sub.id)} className="flex-1 py-2 rounded-lg flex items-center justify-center gap-2 bg-white/5 text-k-silver-dim hover:text-red-400 hover:bg-red-400/10 transition-all text-sm">
                <Trash2 size={14} /> <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-k-silver-dim text-sm bg-black/20 backdrop-blur-md border border-white/10 rounded-xl">
            No submissions found
          </div>
        )}
      </div>

      {/* View Modal */}
      {modalOpen && viewing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl w-full max-w-3xl p-0 relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40 backdrop-blur-xl/40 shrink-0">
              <h2 className="font-display text-lg font-bold text-white flex items-center gap-3">
                Submission Details
                <span className="font-mono text-xs font-bold text-white bg-white/5 px-2 py-1 rounded tracking-wider">
                  {viewing.trackingId}
                </span>
              </h2>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-k-silver-dim hover:text-white hover:bg-white/[0.06]">
                <X size={16} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs text-k-silver-dim uppercase tracking-wider font-bold mb-4">Customer Info</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <User size={16} className="text-k-silver-dim mt-0.5" />
                        <div>
                          <p className="text-xs text-k-silver-dim uppercase">Name</p>
                          <p className="text-sm text-white">{viewing.name}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Mail size={16} className="text-k-silver-dim mt-0.5" />
                        <div>
                          <p className="text-xs text-k-silver-dim uppercase">Email</p>
                          <p className="text-sm text-white">{viewing.email}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone size={16} className="text-k-silver-dim mt-0.5" />
                        <div>
                          <p className="text-xs text-k-silver-dim uppercase">Phone</p>
                          <p className="text-sm text-white">{viewing.phone || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Calendar size={16} className="text-k-silver-dim mt-0.5" />
                        <div>
                          <p className="text-xs text-k-silver-dim uppercase">Date Submitted</p>
                          <p className="text-sm text-white">{new Date(viewing.createdAt).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs text-k-silver-dim uppercase tracking-wider font-bold mb-3">Project Requirements</h3>
                    <div className="p-4 bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 text-sm text-white/90 leading-relaxed whitespace-pre-wrap">
                      {viewing.message}
                    </div>
                  </div>
                </div>

                {/* Right Column: File & Status */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs text-k-silver-dim uppercase tracking-wider font-bold mb-4">Update Status</h3>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => updateStatus(viewing.id, 'new')}
                        className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider border ${viewing.status === 'new' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-black/40 backdrop-blur-xl text-k-silver-dim border-k-border hover:border-k-silver/40'}`}
                      >
                        New
                      </button>
                      <button 
                        onClick={() => updateStatus(viewing.id, 'in_progress')}
                        className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider border ${viewing.status === 'in_progress' ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' : 'bg-black/40 backdrop-blur-xl text-k-silver-dim border-k-border hover:border-k-silver/40'}`}
                      >
                        In Progress
                      </button>
                      <button 
                        onClick={() => updateStatus(viewing.id, 'completed')}
                        className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider border ${viewing.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-black/40 backdrop-blur-xl text-k-silver-dim border-k-border hover:border-k-silver/40'}`}
                      >
                        Completed
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs text-k-silver-dim uppercase tracking-wider font-bold mb-3 flex items-center gap-2">
                      <ImageIcon size={14} /> Attached File
                    </h3>
                    {viewing.file_url ? (
                      <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-xl group relative">
                        {/* Try to show image preview if it's an image, else provide a link */}
                        {viewing.file_url.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                          <div className="relative aspect-video">
                            <img src={viewing.file_url} alt="Attachment" className="w-full h-full object-cover" />
                            <a href={viewing.file_url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium text-sm backdrop-blur-sm">
                              Open Full Size
                            </a>
                          </div>
                        ) : (
                          <div className="p-8 flex flex-col items-center justify-center text-center">
                            <ImageIcon size={32} className="text-k-silver-dim mb-3" />
                            <p className="text-sm text-white mb-4">Non-image file attached</p>
                            <a href={viewing.file_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gradient-to-r from-white to-k-silver text-k-black rounded-lg text-xs font-semibold">
                              Download / View File
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-6 rounded-xl border border-dashed border-k-border bg-black/40 backdrop-blur-xl/50 flex flex-col items-center justify-center text-k-silver-dim">
                        <ImageIcon size={24} className="mb-2 opacity-50" />
                        <span className="text-sm">No file attached</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-k-border bg-black/40 backdrop-blur-xl/40 flex justify-end shrink-0">
              <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-sm text-white bg-white/10 hover:bg-white/20 font-semibold rounded-xl transition-all">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
