import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import { Plus, Edit3, Trash2, X, Package, ToggleLeft, ToggleRight, AlertCircle, Loader } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'https://server.shapio3d.com/api';

const getAuthHeader = async () => {
 const { data: { session } } = await supabase.auth.getSession();
 return {
 'Authorization': `Bearer ${session?.access_token}`
 // Don't set Content-Type here, let fetch handle it for FormData
 };
}

export default function Products() {
 const queryClient = useQueryClient()
 const [modalOpen, setModalOpen] = useState(false)
 const [editing, setEditing] = useState(null)
 const [form, setForm] = useState({ name: '', description: '', material: '', price: '' })
 const [file, setFile] = useState(null)
 const [errorMsg, setErrorMsg] = useState('')

 const { data: products = [], isLoading, isError } = useQuery({
 queryKey: ['products'],
 queryFn: async () => {
 const headers = await getAuthHeader();
 const res = await fetch(`${API_URL}/products`, { 
 headers: {
 'Authorization': headers.Authorization,
 'Content-Type': 'application/json'
 }
 });
 if (!res.ok) throw new Error('Failed to fetch products')
 return res.json();
 }
 })

 const saveMutation = useMutation({
 mutationFn: async (payload) => {
 const headers = await getAuthHeader();
 
 const formData = new FormData();
 formData.append('name', payload.name);
 if (payload.description) formData.append('description', payload.description);
 if (payload.material) formData.append('material', payload.material);
 if (payload.price) formData.append('price', payload.price);
 formData.append('isActive', payload.isActive);
 
 if (file) {
 formData.append('file', file);
 }

 const url = editing ? `${API_URL}/products/${editing.id}` : `${API_URL}/products`;
 const method = editing ? 'PUT' : 'POST';

 const res = await fetch(url, {
 method,
 headers,
 body: formData
 });
 
 if (!res.ok) {
 const data = await res.json();
 throw new Error(data.error || 'Failed to save product');
 }
 return res.json();
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['products'] })
 queryClient.invalidateQueries({ queryKey: ['dashboard'] })
 setModalOpen(false)
 },
 onError: (err) => {
 setErrorMsg(err.message)
 }
 })

 const toggleMutation = useMutation({
 mutationFn: async ({ id, isActive }) => {
 const headers = await getAuthHeader();
 const formData = new FormData();
 formData.append('isActive', !isActive);

 const res = await fetch(`${API_URL}/products/${id}`, {
 method: 'PUT',
 headers,
 body: formData
 });
 if (!res.ok) throw new Error('Failed to toggle product status');
 return res.json();
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['products'] })
 queryClient.invalidateQueries({ queryKey: ['dashboard'] })
 }
 })

 const deleteMutation = useMutation({
 mutationFn: async (id) => {
 const headers = await getAuthHeader();
 const res = await fetch(`${API_URL}/products/${id}`, {
 method: 'DELETE',
 headers: {
 'Authorization': headers.Authorization,
 'Content-Type': 'application/json'
 }
 });
 if (!res.ok) throw new Error('Failed to delete product');
 return id;
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['products'] })
 queryClient.invalidateQueries({ queryKey: ['dashboard'] })
 }
 })

 const openNew = () => {
 setEditing(null)
 setForm({ name: '', description: '', material: '', price: '' })
 setFile(null)
 setErrorMsg('')
 setModalOpen(true)
 }

 const openEdit = (product) => {
 setEditing(product)
 setForm({ 
 name: product.name, 
 description: product.description || '', 
 material: product.material || '', 
 price: product.price || '' 
 })
 setFile(null)
 setErrorMsg('')
 setModalOpen(true)
 }

 const handleSave = () => {
 if (!form.name) {
 setErrorMsg('Product name is required');
 return;
 }
 
 saveMutation.mutate({
 name: form.name,
 description: form.description,
 material: form.material,
 price: form.price,
 isActive: editing ? editing.isActive : true
 })
 }

 const handleDelete = (id) => {
 if (!confirm('Are you sure you want to delete this product?')) return;
 deleteMutation.mutate(id)
 }

 if (isLoading) {
 return (
 <div className="flex h-[calc(100vh-80px)] items-center justify-center">
 <div className="flex gap-2">
 <span className="w-2 h-2 rounded-full bg-k-silver animate-pulse" />
 <span className="w-2 h-2 rounded-full bg-k-silver animate-pulse" style={{ animationDelay: '0.2s' }} />
 <span className="w-2 h-2 rounded-full bg-k-silver animate-pulse" style={{ animationDelay: '0.4s' }} />
 </div>
 </div>
 )
 }

 if (isError) {
 return (
 <div className="flex h-[calc(100vh-80px)] flex-col items-center justify-center text-red-400 gap-4">
 <AlertCircle size={32} />
 <p className="text-sm">Failed to load products. Please try refreshing.</p>
 </div>
 )
 }

 return (
 <div>
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
 <div>
 <h1 className="font-display text-2xl font-bold text-gray-900 tracking-tight">Products</h1>
 <p className="text-sm font-medium text-slate-500 mt-1">{products.length} products · {products.filter(p => p.isActive).length} active</p>
 </div>
 <button onClick={openNew} className="flex items-center justify-center sm:justify-start gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm w-full sm:w-auto">
 <Plus size={16} /> Add Product
 </button>
 </div>

 {/* Product grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
 {products.map((product) => (
 <div
 key={product.id}
 className={`bg-white border rounded-xl overflow-hidden transition-all hover:shadow-md ${
 product.isActive ? 'border-gray-200 shadow-sm' : 'border-gray-100 opacity-60'
 }`}
 >
 {/* Image placeholder / 3D viewer area */}
 <div className="h-40 bg-gray-50 flex items-center justify-center relative overflow-hidden group border-b border-gray-100">
 {product.modelUrl ? (
 <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent flex flex-col justify-end p-4">
 <div className="flex items-center gap-2 text-white text-xs font-semibold">
 <Package size={14} />
 <span>3D Model Attached</span>
 </div>
 </div>
 ) : (
 <Package size={40} className="text-gray-200" />
 )}
 
 {/* Active badge */}
 <span className={`absolute top-3 right-3 z-10 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold ${
 product.isActive ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-slate-500 bg-gray-50 border border-gray-200'
 }`}>
 {product.isActive ? 'Active' : 'Inactive'}
 </span>
 </div>

 {/* Info */}
 <div className="p-5">
 <h3 className="font-semibold text-sm text-gray-900 mb-1">{product.name}</h3>
 <p className="text-xs text-slate-500 mb-3 line-clamp-2">{product.description || 'No description'}</p>
 <div className="flex items-center justify-between mb-4">
 <span className="text-xs font-medium text-slate-500 px-2 py-0.5 rounded bg-gray-100">{product.material || 'N/A'}</span>
 <span className="text-sm font-bold text-gray-900">₹{(product.price || 0).toLocaleString('en-IN')}</span>
 </div>

 {/* Actions */}
 <div className="flex items-center justify-between pt-3 border-t border-gray-100">
 <button
 onClick={() => toggleMutation.mutate({ id: product.id, isActive: product.isActive })}
 disabled={toggleMutation.isPending}
 className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
 product.isActive ? 'text-emerald-600 hover:text-emerald-700' : 'text-slate-400 hover:text-gray-700'
 }`}
 >
 {product.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
 {product.isActive ? 'Active' : 'Inactive'}
 </button>
 <div className="flex items-center gap-1">
 <button onClick={() => openEdit(product)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
 <Edit3 size={13} />
 </button>
 <button onClick={() => handleDelete(product.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all">
 <Trash2 size={13} />
 </button>
 </div>
 </div>
 </div>
 </div>
 ))}
 {products.length === 0 && (
 <div className="col-span-full py-12 text-center text-slate-500 font-medium text-sm border border-dashed border-gray-200 rounded-xl bg-white">
 No products found. Add one to get started.
 </div>
 )}
 </div>

 {/* Modal */}
 {modalOpen && (
 <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
 <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg p-8 relative shadow-xl">
 <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
 <X size={16} />
 </button>
 <h2 className="font-display text-lg font-bold text-gray-900 mb-6">
 {editing ? 'Edit Product' : 'Add Product'}
 </h2>

 <div className="space-y-4">
 <div>
 <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Product Name *</label>
 <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-sm" />
 </div>
 <div>
 <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Description</label>
 <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-sm resize-none" />
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Material</label>
 <input value={form.material} onChange={e => setForm({...form, material: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-sm" />
 </div>
 <div>
 <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Price (₹)</label>
 <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-sm" />
 </div>
 </div>
 
 {/* GLB upload */}
 <div>
 <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">3D Model (.glb)</label>
 <label className={`flex items-center gap-3 px-4 py-3 bg-white border ${file ? 'border-blue-400 border-solid' : 'border-dashed border-gray-300'} rounded-lg cursor-pointer hover:border-blue-400 transition-colors shadow-sm`}>
 <Package size={16} className={file ? 'text-blue-600' : 'text-slate-400'} />
 <span className={`text-sm font-medium ${file ? 'text-blue-600' : 'text-slate-500'}`}>
 {file ? file.name : (editing?.modelUrl ? 'Upload new .glb to replace existing' : 'Click to upload .glb model file')}
 </span>
 <input 
 type="file" 
 accept=".glb,.gltf" 
 className="hidden" 
 onChange={e => {
 if (e.target.files?.[0]) {
 setFile(e.target.files[0])
 setErrorMsg('')
 }
 }} 
 />
 </label>
 {file && (
 <button onClick={() => setFile(null)} className="mt-2 text-xs font-semibold text-red-500 hover:text-red-700">
 Remove selected file
 </button>
 )}
 </div>

 {errorMsg && (
 <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm font-medium text-red-600">
 {errorMsg}
 </div>
 )}
 </div>

 <div className="flex justify-end gap-3 mt-6">
 <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">Cancel</button>
 <button 
 onClick={handleSave} 
 disabled={saveMutation.isPending}
 className="flex items-center gap-2 px-5 py-2.5 text-sm bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
 >
 {saveMutation.isPending && <Loader size={14} className="animate-spin" />}
 {editing ? 'Save Changes' : 'Add Product'}
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 )
}
