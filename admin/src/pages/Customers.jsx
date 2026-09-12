import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import { Search, Plus, Edit3, Trash2, X, AlertCircle, ArrowLeft } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'https://server.shapio3d.com/api';

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
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-[calc(100vh-80px)] flex-col items-center justify-center text-red-500 gap-4">
        <AlertCircle size={32} />
        <p className="text-sm font-semibold text-gray-700">Failed to load customers. Please try refreshing.</p>
      </div>
    )
  }

  if (activeTab === 'create' || activeTab === 'edit') {
    return (
      <div className="pb-12">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setActiveTab('list')} className="p-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl transition-all shadow-sm">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-display text-2xl font-bold text-gray-900 tracking-tight">
            {activeTab === 'edit' ? 'Edit Customer' : 'Create New Customer'}
          </h1>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Name *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" placeholder="Customer Name" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Phone *</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" placeholder="Phone Number" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Email</label>
              <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" placeholder="Email Address" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Company Name</label>
              <input value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" placeholder="Company (Optional)" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Billing Address</label>
            <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} rows={3} placeholder="Street, City, State, ZIP..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition-colors" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">PAN No</label>
              <input value={form.panNumber} onChange={e => setForm({...form, panNumber: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" placeholder="Permanent Account Number" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">GSTIN</label>
              <input value={form.gstNumber} onChange={e => setForm({...form, gstNumber: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" placeholder="GST Number" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-white uppercase tracking-wider mb-2">Internal Notes</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm font-normal text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 resize-none" placeholder="Any special instructions or notes..." />
          </div>

          <div className="pt-6 border-t border-gray-200 flex gap-4 justify-end">
            <button onClick={() => setActiveTab('list')} className="px-8 py-3.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 shadow-sm rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all">
              Cancel
            </button>
            <button disabled={saveMutation.isPending} onClick={handleSave} className="px-8 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all disabled:opacity-50">
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
          <h1 className="font-display text-2xl font-bold text-gray-900 tracking-tight">Customers</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">{customers.length} total customers</p>
        </div>
        <button onClick={handleNew} className="flex items-center justify-center sm:justify-start gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all w-full sm:w-auto">
          <Plus size={16} /> Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute top-3.5 left-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, company, or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full lg:max-w-md pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-sm"
        />
      </div>

      {/* Table - Desktop View */}
      <div className="hidden md:block bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Customer</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Phone</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Company</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Location</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Added</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cust, index) => (
                <tr 
                  key={cust.id} 
                  className={`border-b border-gray-200 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'
                  } hover:bg-blue-50/50`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-blue-700">{cust.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{cust.name}</p>
                        <p className="text-xs font-medium text-slate-500">{cust.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-700">{cust.phone}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-700">{cust.company || '—'}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-500">{cust.billAddress || cust.address || '—'}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-500">
                    {new Date(cust.createdAt || new Date()).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(cust)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => handleDelete(cust.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm font-medium">
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
          <div key={cust.id} className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-blue-700">{cust.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{cust.name}</p>
                  <p className="text-xs font-medium text-slate-500">{cust.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleEdit(cust)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50 text-slate-400 hover:text-blue-600 transition-all">
                  <Edit3 size={14} />
                </button>
                <button onClick={() => handleDelete(cust.id)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50 text-slate-400 hover:text-red-600 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-3 pt-3 border-t border-gray-100">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Phone</p>
                <p className="text-sm font-semibold text-gray-900">{cust.phone}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Company</p>
                <p className="text-sm font-semibold text-gray-900">{cust.company || '—'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Location</p>
                <p className="text-sm font-medium text-gray-700">{cust.billAddress || cust.address || '—'}</p>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center p-6 bg-white border border-gray-200 shadow-sm rounded-xl text-slate-500 text-sm font-medium">
            No customers found
          </div>
        )}
      </div>
    </div>
  )
}
