import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import { Search, Plus, Edit3, Trash2, X, AlertCircle, ArrowLeft } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeader = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Authorization': `Bearer ${session?.access_token}`,
    'Content-Type': 'application/json'
  };
}

export default function Customers() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('list') // 'list' | 'create' | 'edit'
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState(null)
  
  const initialForm = { name: '', email: '', phone: '', company: '', address: '', notes: '', panNumber: '', gstNumber: '' };
  const [form, setForm] = useState(initialForm)

  const { data: customers = [], isLoading, isError } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/customers`, { headers });
      if (!res.ok) throw new Error('Failed to fetch customers')
      return res.json();
    }
  })

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      const headers = await getAuthHeader();
      if (editingId) {
        const res = await fetch(`${API_URL}/customers/${editingId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to update customer');
        return res.json();
      } else {
        const res = await fetch(`${API_URL}/customers`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to create customer');
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setActiveTab('list')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/customers/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!res.ok) throw new Error('Failed to delete customer');
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })

  const filtered = customers.filter(c =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.company || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
  )

  const handleNew = () => {
    setEditingId(null)
    setForm(initialForm)
    setActiveTab('create')
  }

  const handleEdit = (customer) => {
    setEditingId(customer.id)
    setForm({ 
      name: customer.name, 
      email: customer.email || '', 
      phone: customer.phone || '', 
      company: customer.company || '', 
      address: customer.billAddress || customer.address || '', 
      notes: customer.notes || '',
      panNumber: customer.panNo || customer.panNumber || '',
      gstNumber: customer.gstNumber || ''
    })
    setActiveTab('edit')
  }

  const handleSave = () => {
    if (!form.name || !form.phone) {
      alert("Name and Phone are required.");
      return;
    }
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      company: form.company,
      billAddress: form.address,
      notes: form.notes,
      panNumber: form.panNumber,
      gstNumber: form.gstNumber
    }
    saveMutation.mutate(payload)
  }

  const handleDelete = (id) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    deleteMutation.mutate(id)
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <div className="flex gap-2">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" style={{ animationDelay: '0.2s' }} />
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-[calc(100vh-80px)] flex-col items-center justify-center text-red-400 gap-4">
        <AlertCircle size={32} />
        <p className="text-sm text-white">Failed to load customers. Please try refreshing.</p>
      </div>
    )
  }

  if (activeTab === 'create' || activeTab === 'edit') {
    return (
      <div className="pb-12">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setActiveTab('list')} className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-xl transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-display text-2xl font-bold text-white tracking-wide">
            {activeTab === 'edit' ? 'Edit Customer' : 'Create New Customer'}
          </h1>
        </div>

        <div className="bg-[#0a0f0d]/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-white uppercase tracking-wider mb-2">Name *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm font-normal text-white placeholder:text-white/40 focus:outline-none focus:border-white/40" placeholder="Customer Name" />
            </div>
            <div>
              <label className="block text-xs text-white uppercase tracking-wider mb-2">Phone *</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm font-normal text-white placeholder:text-white/40 focus:outline-none focus:border-white/40" placeholder="Phone Number" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-white uppercase tracking-wider mb-2">Email</label>
              <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm font-normal text-white placeholder:text-white/40 focus:outline-none focus:border-white/40" placeholder="Email Address" />
            </div>
            <div>
              <label className="block text-xs text-white uppercase tracking-wider mb-2">Company Name</label>
              <input value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm font-normal text-white placeholder:text-white/40 focus:outline-none focus:border-white/40" placeholder="Company (Optional)" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-white uppercase tracking-wider mb-2">Billing Address</label>
            <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} rows={3} placeholder="Street, City, State, ZIP..." className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm font-normal text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 resize-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-white uppercase tracking-wider mb-2">PAN No</label>
              <input value={form.panNumber} onChange={e => setForm({...form, panNumber: e.target.value})} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm font-normal text-white placeholder:text-white/40 focus:outline-none focus:border-white/40" placeholder="Permanent Account Number" />
            </div>
            <div>
              <label className="block text-xs text-white uppercase tracking-wider mb-2">GSTIN</label>
              <input value={form.gstNumber} onChange={e => setForm({...form, gstNumber: e.target.value})} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm font-normal text-white placeholder:text-white/40 focus:outline-none focus:border-white/40" placeholder="GST Number" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-white uppercase tracking-wider mb-2">Internal Notes</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm font-normal text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 resize-none" placeholder="Any special instructions or notes..." />
          </div>

          <div className="pt-6 border-t border-white/10 flex gap-4 justify-end">
            <button onClick={() => setActiveTab('list')} className="px-8 py-4 bg-[#0a0f0d]/60 backdrop-blur-2xl hover:bg-white/10 text-white font-bold rounded-xl transition-colors">
              Cancel
            </button>
            <button disabled={saveMutation.isPending} onClick={handleSave} className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:shadow-lg hover:shadow-white/20 transition-all disabled:opacity-50">
              {saveMutation.isPending ? 'Saving...' : activeTab === 'edit' ? 'Save Changes' : 'Create Customer'}
            </button>
          </div>

        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-white tracking-wide">Customers</h1>
          <p className="text-sm text-white/70 mt-1">{customers.length} total customers</p>
        </div>
        <button onClick={handleNew} className="flex items-center justify-center sm:justify-start gap-2 px-5 py-3 bg-white text-black text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-white/20 transition-all w-full sm:w-auto">
          <Plus size={16} /> Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute top-3.5 left-4 text-white/50" />
        <input
          type="text"
          placeholder="Search by name, company, or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full lg:max-w-md pl-11 pr-4 py-3 bg-[#0a0f0d]/60 backdrop-blur-2xl border border-white/10 rounded-xl text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 transition-colors"
        />
      </div>

      {/* Table - Desktop View */}
      <div className="hidden md:block bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-4 text-xs text-white/90 font-display uppercase tracking-wider">Customer</th>
                <th className="text-left px-6 py-4 text-xs text-white/90 font-display uppercase tracking-wider">Phone</th>
                <th className="text-left px-6 py-4 text-xs text-white/90 font-display uppercase tracking-wider">Company</th>
                <th className="text-left px-6 py-4 text-xs text-white/90 font-display uppercase tracking-wider">Location</th>
                <th className="text-left px-6 py-4 text-xs text-white/90 font-display uppercase tracking-wider">Added</th>
                <th className="text-right px-6 py-4 text-xs text-white/90 font-display uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cust) => (
                <tr key={cust.id} className="border-b border-white/5 hover:bg-[#111111] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-white">{cust.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white/80 font-sans">{cust.name}</p>
                        <p className="text-xs text-white/50 font-sans">{cust.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/80 font-sans">{cust.phone}</td>
                  <td className="px-6 py-4 text-sm text-white/80 font-sans">{cust.company || '—'}</td>
                  <td className="px-6 py-4 text-sm text-white/60 font-sans">{cust.billAddress || cust.address || '—'}</td>
                    {new Date(cust.createdAt || new Date()).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(cust)} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => handleDelete(cust.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/50 text-sm">
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-4">
        {filtered.map((cust) => (
          <div key={cust.id} className="bg-[#0a0f0d]/60 backdrop-blur-2xl border border-white/10 rounded-xl p-4 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-white">{cust.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{cust.name}</p>
                  <p className="text-xs text-white/50">{cust.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleEdit(cust)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#0a0f0d]/60 backdrop-blur-2xl text-white/60 hover:text-white transition-all">
                  <Edit3 size={14} />
                </button>
                <button onClick={() => handleDelete(cust.id)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#0a0f0d]/60 backdrop-blur-2xl text-white/60 hover:text-red-400 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-3 pt-3 border-t border-white/10">
              <div>
                <p className="text-[10px] text-white/60 uppercase tracking-wider mb-1">Phone</p>
                <p className="text-sm text-white/80">{cust.phone}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/60 uppercase tracking-wider mb-1">Company</p>
                <p className="text-sm text-white/80">{cust.company || '—'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] text-white/60 uppercase tracking-wider mb-1">Location</p>
                <p className="text-sm text-white/60">{cust.billAddress || cust.address || '—'}</p>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center p-6 bg-[#0a0f0d]/60 backdrop-blur-2xl border border-white/10 rounded-xl text-white/50 text-sm">
            No customers found
          </div>
        )}
      </div>
    </div>
  )
}
