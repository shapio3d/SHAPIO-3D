import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import { Search, Plus, FileDown, Upload, Edit3, Trash2, Download, X, Filter, AlertCircle } from 'lucide-react'

const STATUS_COLORS = {
  PAID: 'text-emerald-300 bg-emerald-500/20 ring-1 ring-emerald-500/30',
  PENDING: 'text-amber-300 bg-amber-500/20 ring-1 ring-amber-500/30',
  OVERDUE: 'text-red-300 bg-red-500/20 ring-1 ring-red-500/30',
  CANCELLED: 'text-gray-300 bg-white/10 ring-1 ring-white/20',
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeader = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Authorization': `Bearer ${session?.access_token}`,
    'Content-Type': 'application/json'
  };
}

const getFinancialYearString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed (0 = Jan, 3 = Apr)
  if (month < 3) {
    return `${(year - 1).toString().slice(-2)}-${year.toString().slice(-2)}`;
  } else {
    return `${year.toString().slice(-2)}-${(year + 1).toString().slice(-2)}`;
  }
};

export default function Invoices() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  
  const { data: invoices = [], isLoading: isLoadingInvoices, isError: isErrorInvoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/invoices`, { headers });
      if (!res.ok) throw new Error('Failed to fetch invoices');
      return res.json();
    }
  })

  const { data: clients = [], isLoading: isLoadingClients, isError: isErrorClients } = useQuery({
    queryKey: ['customers'], // Reuse customers query key if we want to share cache
    queryFn: async () => {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/customers`, { headers });
      if (!res.ok) throw new Error('Failed to fetch clients');
      return res.json();
    }
  })

  const [form, setForm] = useState({
    clientId: '',
    invoiceNumber: '', 
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    terms: 'Due on Receipt',
    placeOfSupply: 'Tamil Nadu (33)',
    panNo: '',
    shipAddress: '',
    items: [{ description: '', hsnSac: '', quantity: 1, rate: '', cgstRatePct: 9, sgstRatePct: 9 }], 
    status: 'UNPAID', 
    notes: ''
  })

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      const headers = await getAuthHeader();
      let res;
      if (editing) {
        res = await fetch(`${API_URL}/invoices/${editing.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${API_URL}/invoices`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
      }
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save invoice");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setModalOpen(false)
    },
    onError: (err) => {
      alert(err.message)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/invoices/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!res.ok) throw new Error('Failed to delete invoice');
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/invoices/${id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })

  const filtered = invoices.filter(inv => {
    const matchSearch = (inv.invoiceNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (inv.client?.name || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = !filterStatus || inv.status === filterStatus
    return matchSearch && matchStatus
  })

  const openNew = () => {
    setEditing(null)
    setForm({
      clientId: clients[0]?.id || '',
      invoiceNumber: `SHP3D/${getFinancialYearString()}/${String(invoices.length + 1).padStart(3, '0')}`,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      terms: 'Due on Receipt',
      placeOfSupply: 'Tamil Nadu (33)',
      panNo: '',
      shipAddress: '',
      items: [{ description: '', hsnSac: '', quantity: 1, rate: '', cgstRatePct: 9, sgstRatePct: 9 }], 
      status: 'UNPAID', 
      notes: ''
    })
    setModalOpen(true)
  }

  const openEdit = (invoice) => {
    setEditing(invoice)
    // Map existing invoice to form
    setForm({ 
      clientId: invoice.clientId || '',
      invoiceNumber: invoice.invoiceNumber || '',
      issueDate: invoice.issueDate ? invoice.issueDate.split('T')[0] : '',
      dueDate: invoice.dueDate ? invoice.dueDate.split('T')[0] : '',
      terms: invoice.terms || 'Due on Receipt',
      placeOfSupply: invoice.placeOfSupply || 'Tamil Nadu (33)',
      panNo: invoice.panNo || '',
      shipAddress: invoice.shipAddress || '',
      items: invoice.items?.length > 0 ? invoice.items.map(i => ({
        description: i.description,
        hsnSac: i.hsnSac,
        quantity: i.quantity,
        rate: i.rate,
        cgstRatePct: i.cgstRatePct,
        sgstRatePct: i.sgstRatePct
      })) : [{ description: '', hsnSac: '', quantity: 1, rate: '', cgstRatePct: 9, sgstRatePct: 9 }],
      status: invoice.status || 'UNPAID', 
      notes: invoice.notes || '' 
    })
    setModalOpen(true)
  }

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { description: '', hsnSac: '', quantity: 1, rate: '', cgstRatePct: 9, sgstRatePct: 9 }] }))
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))
  const updateItem = (i, field, val) => {
    setForm(f => ({
      ...f,
      items: f.items.map((item, idx) => idx === i ? { ...item, [field]: val } : item)
    }))
  }

  // Frontend calculation just for display in the form (backend recalculates securely)
  let subtotal = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  form.items.forEach(item => {
    const amt = item.quantity * item.rate;
    subtotal += amt;
    totalCgst += amt * (item.cgstRatePct / 100);
    totalSgst += amt * (item.sgstRatePct / 100);
  });
  const total = subtotal + totalCgst + totalSgst;

  const handleSave = () => {
    if (!form.clientId || !form.invoiceNumber) {
      alert("Please select a client and provide an invoice number.");
      return;
    }
    
    saveMutation.mutate(form)
  }

  const handleDelete = (id) => {
    if(!confirm("Are you sure you want to delete this invoice?")) return;
    deleteMutation.mutate(id)
  }

  if (isLoadingInvoices || isLoadingClients) {
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

  if (isErrorInvoices || isErrorClients) {
    return (
      <div className="flex h-[calc(100vh-80px)] flex-col items-center justify-center text-red-400 gap-4">
        <AlertCircle size={32} />
        <p className="text-sm">Failed to load invoices. Please try refreshing.</p>
      </div>
    )
  }

  const handleDownloadPdf = async (id) => {
    try {
      const headers = await getAuthHeader();
      // Remove Content-Type for GET request
      delete headers['Content-Type'];

      const res = await fetch(`${API_URL}/invoices/${id}/pdf`, {
        method: 'GET',
        headers
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to download PDF");
        return;
      }

      const data = await res.json();
      
      // Decode base64 to Blob to bypass IDM
      const binaryString = window.atob(data.pdf);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("An error occurred while downloading PDF: " + (e.message || String(e)));
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-white tracking-wide">Invoices</h1>
          <p className="text-sm text-k-silver-dim mt-1">{invoices.length} total invoices</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-white to-k-silver text-k-black text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-white/10 transition-all" onClick={openNew}>
            <Plus size={16} /> New Invoice
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute top-3.5 left-4 text-k-silver-dim" />
          <input
            type="text"
            placeholder="Search by invoice #..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-black/20 backdrop-blur-md border border-white/10 rounded-xl text-sm text-white placeholder:text-k-silver-dim/40 focus:outline-none focus:border-k-silver/40 transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-4 text-[11px] text-k-silver-dim uppercase tracking-wider font-medium">Invoice #</th>
                <th className="text-left px-6 py-4 text-[11px] text-k-silver-dim uppercase tracking-wider font-medium">Customer</th>
                <th className="text-right px-6 py-4 text-[11px] text-k-silver-dim uppercase tracking-wider font-medium">Amount</th>
                <th className="text-center px-6 py-4 text-[11px] text-k-silver-dim uppercase tracking-wider font-medium">Status</th>
                <th className="text-left px-6 py-4 text-[11px] text-k-silver-dim uppercase tracking-wider font-medium">Date</th>
                <th className="text-right px-6 py-4 text-[11px] text-k-silver-dim uppercase tracking-wider font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr key={inv.id} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-white font-display tracking-wide">{inv.invoiceNumber}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-white">{inv.client?.name}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-semibold text-white">₹{(inv.total || 0).toLocaleString('en-IN')}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <select
                      value={inv.status}
                      onChange={(e) => updateStatusMutation.mutate({ id: inv.id, status: e.target.value })}
                      className={`inline-block px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-semibold appearance-none cursor-pointer outline-none ${STATUS_COLORS[inv.status] || STATUS_COLORS.PENDING}`}
                      style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                    >
                      {Object.keys(STATUS_COLORS).map(status => (
                        <option key={status} value={status} className="bg-black/20 backdrop-blur-md text-white normal-case">
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-k-silver-dim">
                    {new Date(inv.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleDownloadPdf(inv.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-k-silver-dim hover:text-white hover:bg-white/[0.06] transition-all" title="Download PDF">
                        <Download size={14} />
                      </button>
                      <button onClick={() => openEdit(inv)} className="w-8 h-8 rounded-lg flex items-center justify-center text-k-silver-dim hover:text-white hover:bg-white/[0.06] transition-all" title="Edit">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => handleDelete(inv.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-k-silver-dim hover:text-red-400 hover:bg-red-400/[0.06] transition-all" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-k-silver-dim text-sm">
                    No invoices found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl w-full max-w-4xl p-8 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-k-silver-dim hover:text-white hover:bg-white/[0.06]">
              <X size={16} />
            </button>
            <h2 className="font-display text-lg font-bold text-white mb-6">
              {editing ? 'Edit Invoice' : 'New Invoice'}
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs text-k-silver-dim uppercase tracking-wider mb-1.5">Invoice #</label>
                  <input value={form.invoiceNumber} onChange={e => setForm({...form, invoiceNumber: e.target.value})} className="w-full px-4 py-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-k-silver/40" />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs text-k-silver-dim uppercase tracking-wider mb-1.5">Client *</label>
                  <select value={form.clientId} onChange={e => {
                    const clientId = e.target.value;
                    const selectedClient = clients.find(c => c.id === clientId);
                    if (selectedClient) {
                      setForm({...form, clientId, panNo: selectedClient.panNo || ''});
                    } else {
                      setForm({...form, clientId});
                    }
                  }} className="w-full px-4 py-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-k-silver/40 appearance-none">
                    <option value="">Select Client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="block text-xs text-k-silver-dim uppercase tracking-wider mb-1.5">Issue Date</label>
                  <input type="date" value={form.issueDate} onChange={e => setForm({...form, issueDate: e.target.value})} className="w-full px-4 py-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-k-silver/40" />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs text-k-silver-dim uppercase tracking-wider mb-1.5">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} className="w-full px-4 py-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-k-silver/40" />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs text-k-silver-dim uppercase tracking-wider mb-1.5">Terms</label>
                  <input value={form.terms} onChange={e => setForm({...form, terms: e.target.value})} className="w-full px-4 py-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-k-silver/40" />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs text-k-silver-dim uppercase tracking-wider mb-1.5">Place of Supply</label>
                  <input value={form.placeOfSupply} onChange={e => setForm({...form, placeOfSupply: e.target.value})} className="w-full px-4 py-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-k-silver/40" placeholder="e.g. Tamil Nadu (33)" />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs text-k-silver-dim uppercase tracking-wider mb-1.5">PAN No</label>
                  <input value={form.panNo} onChange={e => setForm({...form, panNo: e.target.value})} className="w-full px-4 py-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-k-silver/40" />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs text-k-silver-dim uppercase tracking-wider mb-1.5">Ship Address</label>
                  <input value={form.shipAddress} onChange={e => setForm({...form, shipAddress: e.target.value})} className="w-full px-4 py-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-k-silver/40" placeholder="Overrides client default" />
                </div>
              </div>

              {/* Line items */}
              <div>
                <label className="block text-xs text-k-silver-dim uppercase tracking-wider mb-3">Line Items</label>
                {/* Headers */}
                <div className="grid grid-cols-12 gap-3 mb-2 text-[10px] text-k-silver-dim uppercase tracking-wider font-semibold px-2">
                  <div className="col-span-3">Description</div>
                  <div className="col-span-2">HSN/SAC</div>
                  <div className="col-span-1 text-center">Qty</div>
                  <div className="col-span-2 text-right">Rate</div>
                  <div className="col-span-1 text-center">CGST %</div>
                  <div className="col-span-1 text-center">SGST %</div>
                  <div className="col-span-2 text-right pr-6">Amount</div>
                </div>
                {form.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-3 mb-3">
                    <input
                      placeholder="Description"
                      value={item.description}
                      onChange={e => updateItem(i, 'description', e.target.value)}
                      className="col-span-3 px-3 py-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-k-silver/40"
                    />
                    <input
                      placeholder="HSN/SAC"
                      value={item.hsnSac}
                      onChange={e => updateItem(i, 'hsnSac', e.target.value)}
                      className="col-span-2 px-3 py-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-k-silver/40"
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity === '' ? '' : item.quantity}
                      onChange={e => updateItem(i, 'quantity', e.target.value.replace(/^0+(?=\d)/, ''))}
                      className="col-span-1 px-3 py-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-sm text-white text-center focus:outline-none focus:border-k-silver/40"
                    />
                    <input
                      type="number"
                      placeholder="Rate"
                      value={item.rate === '' ? '' : item.rate}
                      onChange={e => updateItem(i, 'rate', e.target.value.replace(/^0+(?=\d)/, ''))}
                      className="col-span-2 px-3 py-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-sm text-white text-right focus:outline-none focus:border-k-silver/40"
                    />
                    <input
                      type="number"
                      placeholder="CGST %"
                      value={item.cgstRatePct === '' ? '' : item.cgstRatePct}
                      onChange={e => updateItem(i, 'cgstRatePct', e.target.value.replace(/^0+(?=\d)/, ''))}
                      className="col-span-1 px-3 py-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-sm text-white text-center focus:outline-none focus:border-k-silver/40"
                    />
                    <input
                      type="number"
                      placeholder="SGST %"
                      value={item.sgstRatePct === '' ? '' : item.sgstRatePct}
                      onChange={e => updateItem(i, 'sgstRatePct', e.target.value.replace(/^0+(?=\d)/, ''))}
                      className="col-span-1 px-3 py-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-sm text-white text-center focus:outline-none focus:border-k-silver/40"
                    />
                    <div className="col-span-2 flex items-center justify-between">
                      <span className="text-sm text-k-silver">₹{(item.quantity * item.rate).toLocaleString('en-IN')}</span>
                      {form.items.length > 1 && (
                        <button onClick={() => removeItem(i)} className="text-k-silver-dim hover:text-red-400">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button onClick={addItem} className="text-xs text-k-silver-dim hover:text-white border border-dashed border-k-border rounded-lg px-4 py-2 hover:border-k-silver/40 transition-all">
                  + Add Item
                </button>
              </div>

              {/* Status and Notes */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs text-k-silver-dim uppercase tracking-wider mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-4 py-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-k-silver/40 appearance-none">
                    <option value="PAID">PAID</option>
                    <option value="UNPAID">UNPAID</option>
                    <option value="OVERDUE">OVERDUE</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="block text-xs text-k-silver-dim uppercase tracking-wider mb-1.5">Notes (Optional)</label>
                  <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full px-4 py-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-k-silver/40 resize-none h-10" />
                </div>
              </div>

              {/* Totals */}
              <div className="bg-k-card/50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-k-silver-dim">Subtotal</span>
                  <span className="text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-k-silver-dim">CGST Total</span>
                  <span className="text-white">₹{totalCgst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-k-silver-dim">SGST Total</span>
                  <span className="text-white">₹{totalSgst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-k-border pt-2">
                  <span className="text-white">Total</span>
                  <span className="text-white font-display">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-sm text-k-silver-dim border border-white/10 rounded-xl hover:text-white hover:border-k-silver/40 transition-all">
                Cancel
              </button>
              <button disabled={saveMutation.isPending} onClick={handleSave} className="px-5 py-2.5 text-sm bg-gradient-to-r from-white to-k-silver text-k-black font-semibold rounded-xl hover:shadow-lg hover:shadow-white/10 transition-all disabled:opacity-50">
                {editing ? 'Save Invoice' : 'Create Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
