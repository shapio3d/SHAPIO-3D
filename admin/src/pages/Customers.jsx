import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import { Search, Plus, Edit3, Trash2, X, AlertCircle } from 'lucide-react'

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
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', address: '', notes: '', panNumber: '', gstNumber: '' })

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
      if (editing) {
        const res = await fetch(`${API_URL}/customers/${editing.id}`, {
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
      setModalOpen(false)
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

  const openNew = () => {
    setEditing(null)
    setForm({ name: '', email: '', phone: '', company: '', address: '', notes: '', panNumber: '', gstNumber: '' })
    setModalOpen(true)
  }

  const openEdit = (customer) => {
    setEditing(customer)
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
    setModalOpen(true)
  }

  const handleSave = () => {
    if (!form.name || !form.phone) return
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
        <p className="text-sm">Failed to load customers. Please try refreshing.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-white tracking-wide">Customers</h1>
          <p className="text-sm text-k-silver-dim mt-1">{customers.length} total customers</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-white to-k-silver text-k-black text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-white/10 transition-all">
          <Plus size={16} /> Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute top-3.5 left-4 text-k-silver-dim" />
        <input
          type="text"
          placeholder="Search by name, company, or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-md pl-11 pr-4 py-3 bg-black/20 backdrop-blur-md border border-white/10 rounded-xl text-sm text-white placeholder:text-k-silver-dim/40 focus:outline-none focus:border-k-silver/40 transition-colors"
        />
      </div>

      {/* Table - Desktop View */}
      <div className="hidden md:block bg-black/20 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-4 text-[11px] text-k-silver-dim uppercase tracking-wider font-medium">Customer</th>
                <th className="text-left px-6 py-4 text-[11px] text-k-silver-dim uppercase tracking-wider font-medium">Phone</th>
                <th className="text-left px-6 py-4 text-[11px] text-k-silver-dim uppercase tracking-wider font-medium">Company</th>
                <th className="text-left px-6 py-4 text-[11px] text-k-silver-dim uppercase tracking-wider font-medium">Location</th>
                <th className="text-left px-6 py-4 text-[11px] text-k-silver-dim uppercase tracking-wider font-medium">Added</th>
                <th className="text-right px-6 py-4 text-[11px] text-k-silver-dim uppercase tracking-wider font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cust) => (
                <tr key={cust.id} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-k-silver/20 to-k-border flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-k-silver">{cust.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{cust.name}</p>
                        <p className="text-xs text-k-silver-dim">{cust.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-k-silver">{cust.phone}</td>
                  <td className="px-6 py-4 text-sm text-k-silver">{cust.company || '—'}</td>
                  <td className="px-6 py-4 text-sm text-k-silver-dim">{cust.billAddress || cust.address || '—'}</td>
                  <td className="px-6 py-4 text-sm text-k-silver-dim">
                    {new Date(cust.createdAt || new Date()).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(cust)} className="w-8 h-8 rounded-lg flex items-center justify-center text-k-silver-dim hover:text-white hover:bg-white/[0.06] transition-all">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => handleDelete(cust.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-k-silver-dim hover:text-red-400 hover:bg-red-400/[0.06] transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-k-silver-dim text-sm">
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
          <div key={cust.id} className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-4 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-k-silver/20 to-k-border flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-k-silver">{cust.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{cust.name}</p>
                  <p className="text-xs text-k-silver-dim">{cust.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(cust)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 text-k-silver-dim hover:text-white transition-all">
                  <Edit3 size={14} />
                </button>
                <button onClick={() => handleDelete(cust.id)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 text-k-silver-dim hover:text-red-400 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-3 pt-3 border-t border-white/10">
              <div>
                <p className="text-[10px] text-k-silver-dim uppercase tracking-wider mb-1">Phone</p>
                <p className="text-sm text-k-silver">{cust.phone}</p>
              </div>
              <div>
                <p className="text-[10px] text-k-silver-dim uppercase tracking-wider mb-1">Company</p>
                <p className="text-sm text-k-silver">{cust.company || '—'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] text-k-silver-dim uppercase tracking-wider mb-1">Location</p>
                <p className="text-sm text-k-silver-dim">{cust.billAddress || cust.address || '—'}</p>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center p-6 bg-black/20 backdrop-blur-md border border-white/10 rounded-xl text-k-silver-dim text-sm">
            No customers found
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
              {editing ? 'Edit Customer' : 'Add Customer'}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-k-silver-dim uppercase tracking-wider mb-1.5">Name *</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-k-silver/40 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs text-k-silver-dim uppercase tracking-wider mb-1.5">Phone *</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-k-silver/40 transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-k-silver-dim uppercase tracking-wider mb-1.5">Email</label>
                <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-k-silver/40 transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-k-silver-dim uppercase tracking-wider mb-1.5">Company</label>
                <input value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="w-full px-4 py-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-k-silver/40 transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-k-silver-dim uppercase tracking-wider mb-1.5">Bill To Address</label>
                <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} rows={3} placeholder="Street, City, State, ZIP..." className="w-full px-4 py-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-k-silver/40 transition-colors resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-k-silver-dim uppercase tracking-wider mb-1.5">PAN No</label>
                  <input value={form.panNumber} onChange={e => setForm({...form, panNumber: e.target.value})} className="w-full px-4 py-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-k-silver/40 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs text-k-silver-dim uppercase tracking-wider mb-1.5">GSTIN</label>
                  <input value={form.gstNumber} onChange={e => setForm({...form, gstNumber: e.target.value})} className="w-full px-4 py-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-k-silver/40 transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-k-silver-dim uppercase tracking-wider mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} className="w-full px-4 py-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-k-silver/40 transition-colors resize-none" />

              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-sm text-k-silver-dim border border-white/10 rounded-xl hover:text-white hover:border-k-silver/40 transition-all">
                Cancel
              </button>
              <button disabled={saveMutation.isPending} onClick={handleSave} className="px-5 py-2.5 text-sm bg-gradient-to-r from-white to-k-silver text-k-black font-semibold rounded-xl hover:shadow-lg hover:shadow-white/10 transition-all disabled:opacity-50">
                {editing ? 'Save Changes' : 'Add Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
