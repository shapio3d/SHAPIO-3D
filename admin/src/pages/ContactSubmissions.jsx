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
 case 'new': return 'bg-blue-50 text-blue-700 border-blue-200'
 case 'in_progress': return 'bg-amber-50 text-amber-700 border-amber-200'
 case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
 default: return 'bg-gray-50 text-gray-700 border-gray-200'
 }
 }

 return (
 <div>
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
 <div>
 <h1 className="font-display text-2xl font-bold text-gray-900 tracking-tight">Contact Submissions</h1>
 <p className="text-sm font-medium text-slate-500 mt-1">{submissions.length} total inquiries</p>
 </div>
 </div>

 {/* Search */}
 <div className="relative mb-6">
 <Search size={16} className="absolute top-3.5 left-4 text-slate-400" />
 <input
 type="text"
 placeholder="Search by name, email, or tracking ID..."
 value={search}
 onChange={e => setSearch(e.target.value)}
 className="w-full lg:max-w-md pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-sm"
 />
 </div>

 {/* Desktop Table View */}
 <div className="hidden md:block bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b border-gray-200 bg-gray-50/50">
 <th className="text-left px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Tracking ID</th>
 <th className="text-left px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Customer</th>
 <th className="text-left px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Date</th>
 <th className="text-left px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Status</th>
 <th className="text-left px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Attachment</th>
 <th className="text-right px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Actions</th>
 </tr>
 </thead>
 <tbody>
 {filtered.map((sub) => (
 <React.Fragment key={sub.id}>
 <tr className={`border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer ${viewingId === sub.id ? 'bg-gray-50' : ''}`} onClick={() => toggleView(sub.id)}>
 <td className="px-6 py-4">
 <span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">{sub.trackingId}</span>
 </td>
 <td className="px-6 py-4">
 <div className="flex items-center gap-3">
 <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
 <span className="text-xs font-bold text-blue-700">{sub.name.charAt(0)}</span>
 </div>
 <div>
 <p className="text-sm font-semibold text-gray-900">{sub.name}</p>
 <p className="text-xs font-medium text-slate-500">{sub.email}</p>
 </div>
 </div>
 </td>
 <td className="px-6 py-4 text-sm font-medium text-gray-700">
 {new Date(sub.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
 </td>
 <td className="px-6 py-4">
 <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full border ${getStatusColor(sub.status)}`}>
 {sub.status || 'new'}
 </span>
 </td>
 <td className="px-6 py-4">
 {sub.file_url ? (
 <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold">
 <ImageIcon size={14} />
 <span>Included</span>
 </div>
 ) : (
 <span className="text-xs font-medium text-slate-400">—</span>
 )}
 </td>
 <td className="px-6 py-4">
 <div className="flex items-center justify-end gap-2">
 <button onClick={(e) => { e.stopPropagation(); toggleView(sub.id); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
 {viewingId === sub.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
 </button>
 <button onClick={(e) => { e.stopPropagation(); handleDelete(sub.id); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all">
 <Trash2 size={14} />
 </button>
 </div>
 </td>
 </tr>
 
 {/* Accordion Row */}
 {viewingId === sub.id && (
 <tr className="border-b border-gray-200 bg-gray-50/80">
 <td colSpan={6} className="px-6 py-8">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 {/* Left Column: Details */}
 <div className="space-y-6">
 <div>
 <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Customer Info</h3>
 <div className="grid grid-cols-2 gap-4">
 <div className="flex items-start gap-3">
 <User size={16} className="text-blue-500 mt-0.5" />
 <div>
 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Name</p>
 <p className="text-sm font-semibold text-gray-900">{sub.name}</p>
 </div>
 </div>
 <div className="flex items-start gap-3">
 <Mail size={16} className="text-blue-500 mt-0.5" />
 <div>
 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email</p>
 <p className="text-sm font-semibold text-gray-900">{sub.email}</p>
 </div>
 </div>
 <div className="flex items-start gap-3">
 <Phone size={16} className="text-blue-500 mt-0.5" />
 <div>
 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Phone</p>
 <p className="text-sm font-semibold text-gray-900">{sub.phone || 'N/A'}</p>
 </div>
 </div>
 <div className="flex items-start gap-3">
 <Calendar size={16} className="text-blue-500 mt-0.5" />
 <div>
 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Date Submitted</p>
 <p className="text-sm font-semibold text-gray-900">{new Date(sub.createdAt).toLocaleString('en-IN')}</p>
 </div>
 </div>
 </div>
 </div>

 <div>
 <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Project Requirements</h3>
 <div className="p-4 bg-white rounded-xl border border-gray-200 text-sm font-medium text-gray-700 leading-relaxed whitespace-pre-wrap shadow-sm">
 {sub.message}
 </div>
 </div>
 </div>

 {/* Right Column: File & Status */}
 <div className="space-y-6">
 <div>
 <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Update Status</h3>
 <div className="flex flex-wrap gap-2">
 <button 
 onClick={() => updateStatus(sub.id, 'new')}
 className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${sub.status === 'new' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-500 border-gray-200 hover:border-gray-300 hover:text-gray-900 shadow-sm'}`}
 >
 New
 </button>
 <button 
 onClick={() => updateStatus(sub.id, 'in_progress')}
 className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${sub.status === 'in_progress' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-white text-slate-500 border-gray-200 hover:border-gray-300 hover:text-gray-900 shadow-sm'}`}
 >
 In Progress
 </button>
 <button 
 onClick={() => updateStatus(sub.id, 'completed')}
 className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${sub.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-slate-500 border-gray-200 hover:border-gray-300 hover:text-gray-900 shadow-sm'}`}
 >
 Completed
 </button>
 </div>
 </div>

 <div>
 <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
 <ImageIcon size={14} className="text-blue-500"/> Attached File
 </h3>
 {sub.file_url ? (
 <div className="rounded-xl overflow-hidden border border-gray-200 bg-white group relative inline-block max-w-xs w-full shadow-sm">
 {/* Try to show image preview if it's an image, else provide a link */}
 {sub.file_url.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
 <div className="relative aspect-video w-full">
 <img src={sub.file_url} alt="Attachment" className="w-full h-full object-cover" />
 <a href={sub.file_url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-gray-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-semibold text-sm ">
 Open Full Size
 </a>
 </div>
 ) : (
 <div className="p-6 flex flex-col items-center justify-center text-center">
 <ImageIcon size={32} className="text-blue-500 mb-3" />
 <p className="text-sm font-semibold text-gray-900 mb-4">Non-image file attached</p>
 <a href={sub.file_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors">
 Download / View File
 </a>
 </div>
 )}
 </div>
 ) : (
 <div className="p-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-gray-500 max-w-xs">
 <ImageIcon size={24} className="mb-2 text-gray-400" />
 <span className="text-xs font-bold text-slate-500">No file attached</span>
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
 <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium text-sm">
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
 <div key={sub.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col transition-all shadow-sm">
 <div className="p-4 flex flex-col gap-4" onClick={() => toggleView(sub.id)}>
 <div className="flex justify-between items-start">
 <div className="flex items-center gap-3">
 <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
 <span className="text-xs font-bold text-blue-700">{sub.name.charAt(0)}</span>
 </div>
 <div>
 <p className="text-sm font-semibold text-gray-900">{sub.name}</p>
 <p className="text-xs font-medium text-slate-500">{sub.email}</p>
 </div>
 </div>
 <button className="w-8 h-8 flex items-center justify-center text-slate-400">
 {viewingId === sub.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
 </button>
 </div>

 <div className="flex justify-between items-center mt-2">
 <div>
 <span className="font-mono text-[10px] font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">{sub.trackingId}</span>
 </div>
 <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full border ${getStatusColor(sub.status)}`}>
 {sub.status || 'new'}
 </span>
 </div>
 
 <div className="flex justify-between items-center pt-4 border-t border-gray-200">
 <div>
 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Attachment</p>
 {sub.file_url ? (
 <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
 <ImageIcon size={14} /> <span>Included</span>
 </div>
 ) : (
 <span className="text-xs font-medium text-slate-400">—</span>
 )}
 </div>
 <div className="text-right">
 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Date</p>
 <p className="text-sm font-semibold text-gray-900">{new Date(sub.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
 </div>
 </div>
 </div>
 
 {/* Mobile Accordion Content */}
 {viewingId === sub.id && (
 <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col gap-6">
 <div>
 <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Customer Info</h3>
 <div className="grid grid-cols-2 gap-4">
 <div className="flex flex-col gap-1">
 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone</p>
 <p className="text-sm font-semibold text-gray-900">{sub.phone || 'N/A'}</p>
 </div>
 <div className="flex flex-col gap-1">
 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</p>
 <p className="text-sm font-semibold text-gray-900">{new Date(sub.createdAt).toLocaleDateString('en-IN')}</p>
 </div>
 </div>
 </div>

 <div>
 <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Message</h3>
 <div className="p-3 bg-white rounded-xl border border-gray-200 text-sm font-medium text-gray-700 leading-relaxed shadow-sm">
 {sub.message}
 </div>
 </div>

 <div>
 <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Update Status</h3>
 <div className="flex flex-wrap gap-2">
 <button 
 onClick={(e) => { e.stopPropagation(); updateStatus(sub.id, 'new'); }}
 className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${sub.status === 'new' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-500 border-gray-200 shadow-sm'}`}
 >
 New
 </button>
 <button 
 onClick={(e) => { e.stopPropagation(); updateStatus(sub.id, 'in_progress'); }}
 className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${sub.status === 'in_progress' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-white text-slate-500 border-gray-200 shadow-sm'}`}
 >
 In Progress
 </button>
 <button 
 onClick={(e) => { e.stopPropagation(); updateStatus(sub.id, 'completed'); }}
 className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${sub.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-slate-500 border-gray-200 shadow-sm'}`}
 >
 Completed
 </button>
 </div>
 </div>
 
 <div className="pt-2 border-t border-gray-200 flex justify-end">
 <button onClick={(e) => { e.stopPropagation(); handleDelete(sub.id); }} className="px-4 py-2 rounded-lg flex items-center justify-center gap-2 bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-all border border-red-200">
 <Trash2 size={14} /> Delete
 </button>
 </div>
 </div>
 )}
 </div>
 ))}
 {filtered.length === 0 && (
 <div className="py-12 text-center text-slate-500 font-medium text-sm bg-white border border-gray-200 rounded-xl shadow-sm">
 No submissions found
 </div>
 )}
 </div>
 </div>
 )
}
