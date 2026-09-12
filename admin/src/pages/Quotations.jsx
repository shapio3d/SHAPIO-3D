import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import { Search, Plus, Edit3, Trash2, Download, X, Filter, AlertCircle, ArrowLeft } from 'lucide-react'

const STATUS_COLORS = {
  ACCEPTED: 'text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200',
  SENT: 'text-blue-700 bg-blue-50 ring-1 ring-blue-200',
  DRAFT: 'text-gray-700 bg-gray-50 ring-1 ring-gray-200',
  REJECTED: 'text-red-700 bg-red-50 ring-1 ring-red-200',
}

const API_URL = import.meta.env.VITE_API_URL || 'https://server.shapio3d.com/api';

const getAuthHeader = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Authorization': `Bearer ${session?.access_token}`,
    'Content-Type': 'application/json'
  };
}

export default function Quotations() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('list') // 'list' | 'create' | 'edit'
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [editingId, setEditingId] = useState(null)
  
  const { data: quotations = [], isLoading: isLoadingQuotations, isError: isErrorQuotations } = useQuery({
    queryKey: ['quotations'],
    queryFn: async () => {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/quotations`, { headers });
      if (!res.ok) throw new Error('Failed to fetch quotations');
      return res.json();
    }
  })

  const { data: clients = [], isLoading: isLoadingClients, isError: isErrorClients } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/customers`, { headers });
      if (!res.ok) throw new Error('Failed to fetch clients');
      return res.json();
    }
  })

  const initialForm = {
    quoteNo: '', 
    customerId: '', 
    items: [{ description: '', hsnSac: '', quantity: 1, rate: '', cgstRatePct: 9, sgstRatePct: 9 }], 
    status: 'DRAFT', 
    validUntil: '',
    notes: ''
  };
  const [form, setForm] = useState(initialForm);
  const [pdfUrl, setPdfUrl] = useState(null);

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      const headers = await getAuthHeader();
      let res;
      if (editingId) {
        res = await fetch(`${API_URL}/quotations/${editingId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${API_URL}/quotations`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
      }
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save quotation");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      alert("Quotation saved successfully!");
      setActiveTab('list')
    },
    onError: (err) => {
      alert(err.message)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/quotations/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!res.ok) throw new Error('Failed to delete quotation');
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/quotations/${id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })

  const filtered = quotations.filter(qt => {
    const matchSearch = (qt.quoteNo || '').toLowerCase().includes(search.toLowerCase()) ||
      (qt.customer?.name || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = !filterStatus || qt.status === filterStatus
    return matchSearch && matchStatus
  })

  const handleNew = () => {
    setEditingId(null)
    setForm({
      quoteNo: `QT-${new Date().getFullYear()}-${String(quotations.length + 1).padStart(3, '0')}`,
      customerId: clients[0]?.id || '', 
      items: [{ description: '', hsnSac: '', quantity: 1, rate: '', cgstRatePct: 9, sgstRatePct: 9 }], 
      status: 'DRAFT',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: ''
    })
    setActiveTab('create')
  }

  const handleEdit = (quote) => {
    setEditingId(quote.id)
    setForm({ 
      quoteNo: quote.quoteNo || '',
      customerId: quote.customerId || '', 
      items: quote.items?.length > 0 ? quote.items.map(i => ({
        description: i.description,
        hsnSac: i.hsnSac || '',
        quantity: i.quantity,
        rate: i.rate,
        cgstRatePct: i.cgstRatePct || 9,
        sgstRatePct: i.sgstRatePct || 9
      })) : [{ description: '', hsnSac: '', quantity: 1, rate: '', cgstRatePct: 9, sgstRatePct: 9 }], 
      status: quote.status || 'DRAFT',
      validUntil: quote.validUntil ? quote.validUntil.split('T')[0] : '',
      notes: quote.notes || ''
    })
    setActiveTab('edit')
  }

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { description: '', hsnSac: '', quantity: 1, rate: '', cgstRatePct: 9, sgstRatePct: 9 }] }))
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))
  const updateItem = (i, field, val) => {
    setForm(f => ({
      ...f,
      items: f.items.map((item, idx) => idx === i ? { ...item, [field]: val } : item)
    }))
  }

  let subtotal = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  form.items.forEach(item => {
    const qty = parseFloat(item.quantity) || 0;
    const rt = parseFloat(item.rate) || 0;
    const cgstPct = parseFloat(item.cgstRatePct) || 0;
    const sgstPct = parseFloat(item.sgstRatePct) || 0;
    const amt = qty * rt;
    subtotal += amt;
    totalCgst += amt * (cgstPct / 100);
    totalSgst += amt * (sgstPct / 100);
  });
  const total = subtotal + totalCgst + totalSgst;

  const handleSave = () => {
    if (!form.customerId || !form.quoteNo) {
      alert("Please select a client and provide a quote number.");
      return;
    }
    
    saveMutation.mutate(form)
  }

  const handlePreview = async () => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/quotations/preview`, {
        method: 'POST',
        headers,
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        let err;
        try { err = await res.json(); } catch(e) {}
        throw new Error((err && err.error) ? err.error : "Preview failed");
      }
      const data = await res.json();
      
      const binaryString = window.atob(data.pdf);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err) {
      alert(err.message);
    }
  }

  const handleDelete = (id) => {
    if(!confirm("Are you sure you want to delete this quotation?")) return;
    deleteMutation.mutate(id)
  }

  const handleViewPdf = async (id, quoteNo) => {
    try {
      const headers = await getAuthHeader();
      delete headers['Content-Type'];

      const res = await fetch(`${API_URL}/quotations/${id}/pdf`, {
        method: 'GET',
        headers
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to load PDF");
        return;
      }

      const data = await res.json();
      
      const binaryString = window.atob(data.pdf);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (e) {
      console.error(e);
      alert("An error occurred while viewing PDF: " + (e.message || String(e)));
    }
  }

  const handleDownloadPdf = async (id, quoteNo) => {
    try {
      const headers = await getAuthHeader();
      delete headers['Content-Type'];

      const res = await fetch(`${API_URL}/quotations/${id}/pdf`, {
        method: 'GET',
        headers
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to download PDF");
        return;
      }

      const data = await res.json();
      
      const binaryString = window.atob(data.pdf);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename || `Quotation_${quoteNo}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("An error occurred while downloading PDF: " + (e.message || String(e)));
    }
  }


  if (pdfUrl) {
    return (
      <div className="flex-1 flex flex-col p-8 bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">PDF Viewer</h1>
          <button onClick={() => setPdfUrl(null)} className="px-6 py-3 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-medium rounded-xl transition-all">
            Back
          </button>
        </div>
        <div className="flex-1 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200">
          <iframe src={pdfUrl} className="w-full h-full border-0" title="PDF Preview" />
        </div>
      </div>
    );
  }

  if (activeTab === 'create' || activeTab === 'edit') {
    return (
      <div className="max-w-5xl mx-auto pb-12 pt-4">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setActiveTab('list')} className="p-2.5 rounded-lg bg-white shadow-sm border border-gray-200 hover:bg-gray-50 text-gray-600 transition-all">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-display text-3xl font-extrabold text-gray-900 tracking-tight">
            {activeTab === 'edit' ? 'Edit Quotation' : 'Create New Quotation'}
          </h1>
        </div>

        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="col-span-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Quote #</label>
              <input value={form.quoteNo} onChange={e => setForm({...form, quoteNo: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="e.g. QT-2026-001" />
            </div>
            <div className="col-span-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Select Existing Client *</label>
              <select value={form.customerId} onChange={e => setForm({...form, customerId: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none transition-all cursor-pointer">
                <option value="">Select Client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none transition-all cursor-pointer">
                <option value="DRAFT">DRAFT</option>
                <option value="SENT">SENT</option>
                <option value="ACCEPTED">ACCEPTED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Valid Until</label>
              <input type="date" value={form.validUntil} onChange={e => setForm({...form, validUntil: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-widest pb-2">Line Items</h3>
            <div className="pb-4">
              <div className="w-full">
                {/* Headers */}
                <div className="hidden md:grid grid-cols-12 gap-3 mb-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <div className="col-span-3">Description</div>
                  <div className="col-span-2">HSN/SAC</div>
                  <div className="col-span-1 text-center">Qty</div>
                  <div className="col-span-2 text-right">Rate (₹)</div>
                  <div className="col-span-1 text-center">CGST %</div>
                  <div className="col-span-1 text-center">SGST %</div>
                  <div className="col-span-2 text-right pr-6">Amount (₹)</div>
                </div>
                {form.items.map((item, i) => (
                  <div key={i}>
                    {/* Mobile card */}
                    <div className="md:hidden bg-gray-50 border border-gray-200 rounded-xl p-3 mb-3 space-y-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Item {i + 1}</span>
                        {form.items.length > 1 && (
                          <button onClick={() => removeItem(i)} className="text-gray-400 hover:text-red-500 p-1 rounded transition-all"><X size={16} /></button>
                        )}
                      </div>
                      <input placeholder="Description" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                      <input placeholder="HSN/SAC" value={item.hsnSac} onChange={e => updateItem(i, 'hsnSac', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Qty</label><input type="number" value={item.quantity === '' ? '' : item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value.replace(/^0+(?=\d)/, ''))} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 placeholder:text-gray-400 text-center focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></div>
                        <div><label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Rate (₹)</label><input type="number" value={item.rate === '' ? '' : item.rate} onChange={e => updateItem(i, 'rate', e.target.value.replace(/^0+(?=\d)/, ''))} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">CGST %</label><input type="number" value={item.cgstRatePct === '' ? '' : item.cgstRatePct} onChange={e => updateItem(i, 'cgstRatePct', e.target.value.replace(/^0+(?=\d)/, ''))} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 placeholder:text-gray-400 text-center focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></div>
                        <div><label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">SGST %</label><input type="number" value={item.sgstRatePct === '' ? '' : item.sgstRatePct} onChange={e => updateItem(i, 'sgstRatePct', e.target.value.replace(/^0+(?=\d)/, ''))} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 placeholder:text-gray-400 text-center focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></div>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <span className="text-xs font-bold text-slate-500 uppercase">Amount</span>
                        <span className="text-sm font-bold text-gray-900">₹{(item.quantity * item.rate).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    {/* Desktop grid row */}
                    <div className="hidden md:grid grid-cols-12 gap-3 mb-3 items-center group">
                      <input placeholder="Description" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} className="col-span-3 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
                      <input placeholder="HSN/SAC" value={item.hsnSac} onChange={e => updateItem(i, 'hsnSac', e.target.value)} className="col-span-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
                      <input type="number" placeholder="Qty" value={item.quantity === '' ? '' : item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value.replace(/^0+(?=\d)/, ''))} className="col-span-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 placeholder:text-gray-400 text-center focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
                      <input type="number" placeholder="Rate" value={item.rate === '' ? '' : item.rate} onChange={e => updateItem(i, 'rate', e.target.value.replace(/^0+(?=\d)/, ''))} className="col-span-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 placeholder:text-gray-400 text-right focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
                      <input type="number" placeholder="CGST %" value={item.cgstRatePct === '' ? '' : item.cgstRatePct} onChange={e => updateItem(i, 'cgstRatePct', e.target.value.replace(/^0+(?=\d)/, ''))} className="col-span-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 placeholder:text-gray-400 text-center focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
                      <input type="number" placeholder="SGST %" value={item.sgstRatePct === '' ? '' : item.sgstRatePct} onChange={e => updateItem(i, 'sgstRatePct', e.target.value.replace(/^0+(?=\d)/, ''))} className="col-span-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 placeholder:text-gray-400 text-center focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
                      <div className="col-span-2 flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-900 w-full text-right pr-2">{(item.quantity * item.rate).toLocaleString('en-IN')}</span>
                        {form.items.length > 1 && (
                          <button onClick={() => removeItem(i)} className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"><X size={16} /></button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={addItem} className="mt-4 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl w-full py-3.5 border border-dashed border-blue-200 transition-all flex items-center justify-center gap-2">
                  <Plus size={16} /> Add Line Item
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-8 pt-4 border-t border-gray-200">
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Notes</label>
              <textarea placeholder="Any special instructions or terms..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={4} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none h-32 transition-colors" />
            </div>

            {/* Totals */}
            <div className="flex-1 min-w-[250px] space-y-3 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Subtotal</span>
                <span className="text-gray-900 font-bold">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">CGST</span>
                <span className="text-gray-900 font-bold">₹{totalCgst.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm pb-4 border-b border-gray-200">
                <span className="text-gray-500 font-medium">SGST</span>
                <span className="text-gray-900 font-bold">₹{totalSgst.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xl font-black pt-2">
                <span className="text-gray-900">Total</span>
                <span className="text-blue-600">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-12 pt-8 border-t border-gray-200">
            <button onClick={() => setActiveTab('list')} className="px-8 py-3.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 shadow-sm rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all">
              Cancel
            </button>
            <button disabled={saveMutation.isPending} onClick={handleSave} className="px-8 py-3.5 text-sm font-bold text-white bg-blue-600 shadow-sm rounded-xl hover:bg-blue-700 hover:shadow transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {saveMutation.isPending ? 'Saving...' : activeTab === 'edit' ? 'Save Quotation' : 'Create Quotation'}
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
          <h1 className="font-display text-4xl font-extrabold text-gray-900 tracking-tight">Quotations</h1>
          <p className="text-sm text-gray-500 mt-1">{quotations.length} total quotes</p>
        </div>
        <button onClick={handleNew} className="flex items-center justify-center sm:justify-start gap-2 px-5 py-2.5 bg-blue-600 text-white shadow-sm text-sm font-semibold rounded-xl hover:bg-blue-700 hover:shadow transition-all w-full sm:w-auto">
          <Plus size={16} /> Create Quote
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
        <div className="relative flex-1 w-full max-w-none lg:max-w-md">
          <Search size={16} className="absolute top-3.5 left-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by quote # or customer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 text-gray-500 shrink-0">
            <Filter size={14} />
            <span className="text-xs font-semibold uppercase sm:hidden">Filter Status</span>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full sm:w-auto">
            {['', 'DRAFT', 'SENT', 'ACCEPTED', 'REJECTED'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`flex-1 sm:flex-none px-4 py-2.5 sm:px-4 sm:py-2 text-sm sm:text-xs font-bold rounded-lg border transition-all text-center ${
                  filterStatus === status
                    ? 'border-transparent text-blue-700 bg-blue-50'
                    : 'border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 bg-white sm:bg-transparent'
                }`}
              >
                {status || 'All'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Quote #</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Customer</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Total</th>
                <th className="text-center px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Valid Until</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingQuotations || isLoadingClients ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
                      <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </td>
                </tr>
              ) : isErrorQuotations || isErrorClients ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-red-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle size={24} />
                      <p className="text-sm">Failed to load quotations. Please try refreshing.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {filtered.map((qt, index) => (
                    <tr 
                      key={qt.id} 
                      className={`border-b border-gray-200 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'
                      } hover:bg-blue-50/50`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{qt.quoteNo}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{qt.customer?.name}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-semibold text-gray-900">₹{(qt.totalAmount || 0).toLocaleString('en-IN')}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <select
                          value={qt.status || 'DRAFT'}
                          onChange={(e) => updateStatusMutation.mutate({ id: qt.id, status: e.target.value })}
                          className={`inline-block px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold appearance-none cursor-pointer outline-none shadow-sm border border-transparent hover:border-gray-300 ${STATUS_COLORS[qt.status] || STATUS_COLORS.DRAFT}`}
                          style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                        >
                          {Object.keys(STATUS_COLORS).map(status => (
                            <option key={status} value={status} className="bg-white text-gray-900 normal-case font-medium">
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(qt.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {qt.validUntil ? new Date(qt.validUntil).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleDownloadPdf(qt.id, qt.quoteNo)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all" title="Download PDF">
                            <Download size={16} />
                          </button>
                          <button onClick={() => handleEdit(qt)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all" title="Edit">
                            <Edit3 size={16} />
                          </button>
                          <button onClick={() => handleDelete(qt.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500 text-sm">
                        No quotations found
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-4">
        {isLoadingQuotations || isLoadingClients ? (
          <div className="py-12 flex items-center justify-center gap-2 bg-white border border-gray-200 shadow-sm rounded-xl">
            <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
            <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        ) : isErrorQuotations || isErrorClients ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 bg-white border border-gray-200 shadow-sm rounded-xl text-red-500">
            <AlertCircle size={24} />
            <p className="text-sm">Failed to load quotations.</p>
          </div>
        ) : (
          <>
            {filtered.map((qt) => (
              <div key={qt.id} className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-sm font-semibold text-gray-900 tracking-wide">{qt.quoteNo}</span>
                    <p className="text-sm font-medium text-gray-500 mt-1">{qt.customer?.name}</p>
                  </div>
                  <select
                    value={qt.status || 'DRAFT'}
                    onChange={(e) => updateStatusMutation.mutate({ id: qt.id, status: e.target.value })}
                    className={`inline-block px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold appearance-none cursor-pointer outline-none shadow-sm border border-transparent hover:border-gray-300 ${STATUS_COLORS[qt.status] || STATUS_COLORS.DRAFT}`}
                    style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                  >
                    {Object.keys(STATUS_COLORS).map(status => (
                      <option key={status} value={status} className="bg-white text-gray-900 normal-case font-medium">
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Total</p>
                    <span className="text-sm font-bold text-gray-900">₹{(qt.totalAmount || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Date</p>
                    <p className="text-sm text-gray-700">{new Date(qt.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200">
                  <button onClick={() => handleDownloadPdf(qt.id, qt.quoteNo)} className="flex-1 py-2 rounded-lg flex items-center justify-center gap-2 bg-gray-50 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all text-sm font-medium">
                    <Download size={16} /> <span className="hidden sm:inline">PDF</span>
                  </button>
                  <button onClick={() => handleEdit(qt)} className="flex-1 py-2 rounded-lg flex items-center justify-center gap-2 bg-gray-50 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all text-sm font-medium">
                    <Edit3 size={16} /> <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button onClick={() => handleDelete(qt.id)} className="flex-1 py-2 rounded-lg flex items-center justify-center gap-2 bg-gray-50 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all text-sm font-medium">
                    <Trash2 size={16} /> <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="py-12 text-center text-gray-500 text-sm bg-white border border-gray-200 shadow-sm rounded-xl">
                No quotations found
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
