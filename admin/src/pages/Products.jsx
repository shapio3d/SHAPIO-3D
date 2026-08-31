import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import { Plus, Edit3, Trash2, X, Package, ToggleLeft, ToggleRight, AlertCircle, Loader } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-white tracking-wide">Products</h1>
          <p className="text-sm text-k-silver-dim mt-1">{products.length} products · {products.filter(p => p.isActive).length} active</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-white to-k-silver text-k-black text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-white/10 transition-all">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map((product) => (
          <div
            key={product.id}
            className={`bg-black/20 backdrop-blur-md border rounded-xl overflow-hidden transition-all hover:border-k-silver/20 ${
              product.isActive ? 'border-k-border' : 'border-k-border/50 opacity-60'
            }`}
          >
            {/* Image placeholder / 3D viewer area */}
            <div className="h-40 bg-k-card flex items-center justify-center relative overflow-hidden group">
              {product.modelUrl ? (
                <div className="absolute inset-0 bg-gradient-to-t from-k-black/80 to-transparent flex flex-col justify-end p-4">
                  <div className="flex items-center gap-2 text-k-silver text-xs">
                    <Package size={14} />
                    <span>3D Model Attached</span>
                  </div>
                </div>
              ) : (
                <Package size={40} className="text-k-border" />
              )}
              
              {/* Active badge */}
              <span className={`absolute top-3 right-3 z-10 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold ${
                product.isActive ? 'text-emerald-400 bg-emerald-400/[0.1] backdrop-blur-sm' : 'text-k-silver-dim bg-k-border/50 backdrop-blur-sm'
              }`}>
                {product.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Info */}
            <div className="p-5">
              <h3 className="font-display text-sm font-semibold text-white mb-1">{product.name}</h3>
              <p className="text-xs text-k-silver-dim mb-3 line-clamp-2">{product.description || 'No description'}</p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-k-silver px-2 py-0.5 rounded bg-k-border/50">{product.material || 'N/A'}</span>
                <span className="text-sm font-bold text-white font-display">₹{(product.price || 0).toLocaleString('en-IN')}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-k-border/50">
                <button
                  onClick={() => toggleMutation.mutate({ id: product.id, isActive: product.isActive })}
                  disabled={toggleMutation.isPending}
                  className={`flex items-center gap-1.5 text-xs transition-colors ${
                    product.isActive ? 'text-emerald-400 hover:text-emerald-300' : 'text-k-silver-dim hover:text-white'
                  }`}
                >
                  {product.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  {product.isActive ? 'Active' : 'Inactive'}
                </button>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(product)} className="w-7 h-7 rounded-lg flex items-center justify-center text-k-silver-dim hover:text-white hover:bg-white/[0.06] transition-all">
                    <Edit3 size={13} />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-k-silver-dim hover:text-red-400 hover:bg-red-400/[0.06] transition-all">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="col-span-full py-12 text-center text-k-silver-dim text-sm border border-dashed border-k-border rounded-xl">
            No products found. Add one to get started.
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl w-full max-w-lg p-8 relative">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-k-silver-dim hover:text-white hover:bg-white/[0.06]">
              <X size={16} />
            </button>
            <h2 className="font-display text-lg font-bold text-white mb-6">
              {editing ? 'Edit Product' : 'Add Product'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-k-silver-dim uppercase tracking-wider mb-1.5">Product Name *</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-k-silver/40" />
              </div>
              <div>
                <label className="block text-xs text-k-silver-dim uppercase tracking-wider mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="w-full px-4 py-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-k-silver/40 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-k-silver-dim uppercase tracking-wider mb-1.5">Material</label>
                  <input value={form.material} onChange={e => setForm({...form, material: e.target.value})} className="w-full px-4 py-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-k-silver/40" />
                </div>
                <div>
                  <label className="block text-xs text-k-silver-dim uppercase tracking-wider mb-1.5">Price (₹)</label>
                  <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full px-4 py-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-k-silver/40" />
                </div>
              </div>
              
              {/* GLB upload */}
              <div>
                <label className="block text-xs text-k-silver-dim uppercase tracking-wider mb-1.5">3D Model (.glb)</label>
                <label className={`flex items-center gap-3 px-4 py-3 bg-black/40 backdrop-blur-xl border ${file ? 'border-k-silver' : 'border-dashed border-k-border'} rounded-lg cursor-pointer hover:border-k-silver-dim transition-colors`}>
                  <Package size={16} className={file ? 'text-k-silver' : 'text-k-silver-dim'} />
                  <span className={`text-sm ${file ? 'text-white font-medium' : 'text-k-silver-dim'}`}>
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
                  <button onClick={() => setFile(null)} className="mt-2 text-xs text-red-400 hover:text-red-300">
                    Remove selected file
                  </button>
                )}
              </div>

              {errorMsg && (
                <div className="px-4 py-3 rounded-xl bg-red-500/[0.08] border border-red-500/20 text-sm text-red-400">
                  {errorMsg}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-sm text-k-silver-dim border border-white/10 rounded-xl hover:text-white hover:border-k-silver/40 transition-all">Cancel</button>
              <button 
                onClick={handleSave} 
                disabled={saveMutation.isPending}
                className="flex items-center gap-2 px-5 py-2.5 text-sm bg-gradient-to-r from-white to-k-silver text-k-black font-semibold rounded-xl hover:shadow-lg hover:shadow-white/10 transition-all disabled:opacity-50"
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
