import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Search, Eye, X, Image as ImageIcon, CheckCircle, Trash2, Calendar, User, Mail, Phone, Hash, ChevronDown, ChevronUp } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'https://server.shapio3d.com/api';

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
 const [viewingId, setViewingId] = useState(null)
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

 const toggleView = (id) => {
 setViewingId(viewingId === id ? null : id)
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
 if (viewingId === id) setViewingId(null)
 } catch (error) {
 console.error(error);
 }
 }

 const getStatusColor = (status) => {
 switch (status) {
 case 'new': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
 case 'in_progress': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
 case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
 default: return 'bg-k-silver-dim/10 text-white border-k-silver-dim/20'
 }
 }

 return (
 <div>
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
 <div>
 <h1 className="font-display text-2xl font-bold text-white tracking-wide">Contact Submissions</h1>
 <p className="text-sm text-white mt-1">{submissions.length} total inquiries</p>
 </div>
 </div>

 {/* Search */}
 <div className="relative mb-6">
 <Search size={16} className="absolute top-3.5 left-4 text-white" />
 <input
 type="text"
 placeholder="Search by name, email, or tracking ID..."
 value={search}
 onChange={e => setSearch(e.target.value)}
 className="w-full lg:max-w-md pl-11 pr-4 py-3 bg-[#0a0a0a]  border border-white/10 rounded-xl text-sm text-white placeholder:text-white focus:outline-none focus:border-white/20 transition-colors"
 />
 </div>

 {/* Desktop Table View */}
 <div className="hidden md:block bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b border-white/5">
 <th className="text-left px-6 py-4 text-xs text-white/90 font-display uppercase tracking-wider">Tracking ID</th>
 <th className="text-left px-6 py-4 text-xs text-white/90 font-display uppercase tracking-wider">Customer</th>
 <th className="text-left px-6 py-4 text-xs text-white/90 font-display uppercase tracking-wider">Date</th>
 <th className="text-left px-6 py-4 text-xs text-white/90 font-display uppercase tracking-wider">Status</th>
 <th className="text-left px-6 py-4 text-xs text-white/90 font-display uppercase tracking-wider">Attachment</th>
 <th className="text-right px-6 py-4 text-xs text-white/90 font-display uppercase tracking-wider">Actions</th>
 </tr>
 </thead>
 <tbody>
 {filtered.map((sub) => (
 <React.Fragment key={sub.id}>
 <tr className={`border-b border-white/5 hover:bg-[#111111] transition-colors cursor-pointer ${viewingId === sub.id ? 'bg-[#111111]' : ''}`} onClick={() => toggleView(sub.id)}>
 <td className="px-6 py-4">
 <span className="font-mono text-xs font-bold text-white bg-white/10 px-2 py-1 rounded">{sub.trackingId}</span>
 </td>
 <td className="px-6 py-4">
 <div className="flex items-center gap-3">
 <div className="w-9 h-9 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/10 flex items-center justify-center shrink-0">
 <span className="text-xs font-bold text-white">{sub.name.charAt(0)}</span>
 </div>
 <div>
 <p className="text-sm font-medium text-white/80 font-sans">{sub.name}</p>
 <p className="text-xs text-white/70 font-sans">{sub.email}</p>
 </div>
 </div>
 </td>
 <td className="px-6 py-4 text-sm text-white/80 font-sans">
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
 <span className="text-xs text-white/50">—</span>
 )}
 </td>
 <td className="px-6 py-4">
 <div className="flex items-center justify-end gap-2">
 <button onClick={(e) => { e.stopPropagation(); toggleView(sub.id); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-white hover:text-white hover:bg-white/[0.06] transition-all">
 {viewingId === sub.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
 </button>
 <button onClick={(e) => { e.stopPropagation(); handleDelete(sub.id); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-white hover:text-red-400 hover:bg-red-400/[0.06] transition-all">
 <Trash2 size={14} />
 </button>
 </div>
 </td>
 </tr>
 
 {/* Accordion Row */}
 {viewingId === sub.id && (
 <tr className="border-b border-white/10 bg-[#0a0f0d]/40">
 <td colSpan={6} className="px-6 py-8">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 {/* Left Column: Details */}
 <div className="space-y-6">
 <div>
 <h3 className="text-xs text-white uppercase tracking-wider font-bold mb-4">Customer Info</h3>
 <div className="grid grid-cols-2 gap-4">
 <div className="flex items-start gap-3">
 <User size={16} className="text-emerald-400 mt-0.5" />
 <div>
 <p className="text-[10px] text-white/70 uppercase tracking-wider mb-1">Name</p>
 <p className="text-sm text-white font-medium">{sub.name}</p>
 </div>
 </div>
 <div className="flex items-start gap-3">
 <Mail size={16} className="text-emerald-400 mt-0.5" />
 <div>
 <p className="text-[10px] text-white/70 uppercase tracking-wider mb-1">Email</p>
 <p className="text-sm text-white font-medium">{sub.email}</p>
 </div>
 </div>
 <div className="flex items-start gap-3">
 <Phone size={16} className="text-emerald-400 mt-0.5" />
 <div>
 <p className="text-[10px] text-white/70 uppercase tracking-wider mb-1">Phone</p>
 <p className="text-sm text-white font-medium">{sub.phone || 'N/A'}</p>
 </div>
 </div>
 <div className="flex items-start gap-3">
 <Calendar size={16} className="text-emerald-400 mt-0.5" />
 <div>
 <p className="text-[10px] text-white/70 uppercase tracking-wider mb-1">Date Submitted</p>
 <p className="text-sm text-white font-medium">{new Date(sub.createdAt).toLocaleString('en-IN')}</p>
 </div>
 </div>
 </div>
 </div>

 <div>
 <h3 className="text-xs text-white uppercase tracking-wider font-bold mb-3">Project Requirements</h3>
 <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-sm text-white leading-relaxed whitespace-pre-wrap">
 {sub.message}
 </div>
 </div>
 </div>

 {/* Right Column: File & Status */}
 <div className="space-y-6">
 <div>
 <h3 className="text-xs text-white uppercase tracking-wider font-bold mb-4">Update Status</h3>
 <div className="flex flex-wrap gap-2">
 <button 
 onClick={() => updateStatus(sub.id, 'new')}
 className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${sub.status === 'new' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' : 'bg-white/5 text-white/70 border-white/10 hover:border-white/30 hover:text-white'}`}
 >
 New
 </button>
 <button 
 onClick={() => updateStatus(sub.id, 'in_progress')}
 className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${sub.status === 'in_progress' ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' : 'bg-white/5 text-white/70 border-white/10 hover:border-white/30 hover:text-white'}`}
 >
 In Progress
 </button>
 <button 
 onClick={() => updateStatus(sub.id, 'completed')}
 className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${sub.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' : 'bg-white/5 text-white/70 border-white/10 hover:border-white/30 hover:text-white'}`}
 >
 Completed
 </button>
 </div>
 </div>

 <div>
 <h3 className="text-xs text-white uppercase tracking-wider font-bold mb-3 flex items-center gap-2">
 <ImageIcon size={14} className="text-emerald-400"/> Attached File
 </h3>
 {sub.file_url ? (
 <div className="rounded-xl overflow-hidden border border-white/10 bg-white/5 group relative inline-block max-w-xs w-full">
 {/* Try to show image preview if it's an image, else provide a link */}
 {sub.file_url.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
 <div className="relative aspect-video w-full">
 <img src={sub.file_url} alt="Attachment" className="w-full h-full object-cover" />
 <a href={sub.file_url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium text-sm ">
 Open Full Size
 </a>
 </div>
 ) : (
 <div className="p-6 flex flex-col items-center justify-center text-center">
 <ImageIcon size={32} className="text-emerald-400 mb-3" />
 <p className="text-sm text-white mb-4">Non-image file attached</p>
 <a href={sub.file_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-lg text-xs font-semibold hover:shadow-lg hover:shadow-emerald-500/20 transition-all">
 Download / View File
 </a>
 </div>
 )}
 </div>
 ) : (
 <div className="p-6 rounded-xl border border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center text-white max-w-xs">
 <ImageIcon size={24} className="mb-2 opacity-30" />
 <span className="text-xs font-medium opacity-50">No file attached</span>
 </div>
 )}
 </div>
 </div>
 </div>
 </td>
 </tr>
 )}
 </React.Fragment>
 ))}
 {!loading && filtered.length === 0 && (
 <tr>
 <td colSpan={6} className="px-6 py-12 text-center text-white text-sm">
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
 <div key={sub.id} className="bg-[#0a0a0a]  border border-white/10 rounded-xl overflow-hidden flex flex-col transition-all shadow-xl shadow-black/10">
 <div className="p-4 flex flex-col gap-4" onClick={() => toggleView(sub.id)}>
 <div className="flex justify-between items-start">
 <div className="flex items-center gap-3">
 <div className="w-9 h-9 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/10 flex items-center justify-center shrink-0">
 <span className="text-xs font-bold text-white">{sub.name.charAt(0)}</span>
 </div>
 <div>
 <p className="text-sm font-medium text-white">{sub.name}</p>
 <p className="text-xs text-white/70">{sub.email}</p>
 </div>
 </div>
 <button className="w-8 h-8 flex items-center justify-center text-white/50">
 {viewingId === sub.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
 </button>
 </div>

 <div className="flex justify-between items-center mt-2">
 <div>
 <span className="font-mono text-[10px] font-bold text-white bg-white/10 px-2 py-1 rounded">{sub.trackingId}</span>
 </div>
 <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full border ${getStatusColor(sub.status)}`}>
 {sub.status || 'new'}
 </span>
 </div>
 
 <div className="flex justify-between items-center pt-4 border-t border-white/10">
 <div>
 <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Attachment</p>
 {sub.file_url ? (
 <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
 <ImageIcon size={14} /> <span>Included</span>
 </div>
 ) : (
 <span className="text-xs text-white/30">—</span>
 )}
 </div>
 <div className="text-right">
 <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Date</p>
 <p className="text-sm text-white font-medium">{new Date(sub.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
 </div>
 </div>
 </div>
 
 {/* Mobile Accordion Content */}
 {viewingId === sub.id && (
 <div className="p-4 bg-white/5 border-t border-white/10 flex flex-col gap-6">
 <div>
 <h3 className="text-xs text-white uppercase tracking-wider font-bold mb-4">Customer Info</h3>
 <div className="grid grid-cols-2 gap-4">
 <div className="flex flex-col gap-1">
 <p className="text-[10px] text-white/50 uppercase tracking-wider">Phone</p>
 <p className="text-sm text-white">{sub.phone || 'N/A'}</p>
 </div>
 <div className="flex flex-col gap-1">
 <p className="text-[10px] text-white/50 uppercase tracking-wider">Date</p>
 <p className="text-sm text-white">{new Date(sub.createdAt).toLocaleDateString('en-IN')}</p>
 </div>
 </div>
 </div>

 <div>
 <h3 className="text-xs text-white uppercase tracking-wider font-bold mb-3">Message</h3>
 <div className="p-3 bg-black/20 rounded-xl border border-white/5 text-sm text-white leading-relaxed">
 {sub.message}
 </div>
 </div>

 <div>
 <h3 className="text-xs text-white uppercase tracking-wider font-bold mb-3">Update Status</h3>
 <div className="flex flex-wrap gap-2">
 <button 
 onClick={(e) => { e.stopPropagation(); updateStatus(sub.id, 'new'); }}
 className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${sub.status === 'new' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-black/20 text-white/70 border-white/10'}`}
 >
 New
 </button>
 <button 
 onClick={(e) => { e.stopPropagation(); updateStatus(sub.id, 'in_progress'); }}
 className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${sub.status === 'in_progress' ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' : 'bg-black/20 text-white/70 border-white/10'}`}
 >
 In Progress
 </button>
 <button 
 onClick={(e) => { e.stopPropagation(); updateStatus(sub.id, 'completed'); }}
 className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${sub.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-black/20 text-white/70 border-white/10'}`}
 >
 Completed
 </button>
 </div>
 </div>
 
 <div className="pt-2 border-t border-white/10 flex justify-end">
 <button onClick={(e) => { e.stopPropagation(); handleDelete(sub.id); }} className="px-4 py-2 rounded-lg flex items-center justify-center gap-2 bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all">
 <Trash2 size={14} /> Delete
 </button>
 </div>
 </div>
 )}
 </div>
 ))}
 {filtered.length === 0 && (
 <div className="py-12 text-center text-white text-sm bg-[#0a0a0a]  border border-white/10 rounded-xl">
 No submissions found
 </div>
 )}
 </div>
 </div>
 )
}
