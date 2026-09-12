import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import { Search, Plus, FileDown, Upload, Edit3, Trash2, Download, X, Filter, AlertCircle, ArrowLeft, Eye } from 'lucide-react'

const STATUS_COLORS = {
  PAID: 'text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200',
  UNPAID: 'text-amber-700 bg-amber-50 ring-1 ring-amber-200',
  OVERDUE: 'text-red-700 bg-red-50 ring-1 ring-red-200',
  CANCELLED: 'text-gray-700 bg-gray-50 ring-1 ring-gray-200',
}

const API_URL = import.meta.env.VITE_API_URL || 'https://server.shapio3d.com/api';

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

function numberToWords(num) {
  if (num === 0) return 'Zero';
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const inWords = (n) => {
    if (n < 20) return a[n];
    let s = b[Math.floor(n / 10)];
    if (n % 10) s += ' ' + a[n % 10];
    return s + ' ';
  };

  let words = '';
  if (Math.floor(num / 10000000) > 0) { words += inWords(Math.floor(num / 10000000)) + 'Crore '; num %= 10000000; }
  if (Math.floor(num / 100000) > 0) { words += inWords(Math.floor(num / 100000)) + 'Lakh '; num %= 100000; }
  if (Math.floor(num / 1000) > 0) { words += inWords(Math.floor(num / 1000)) + 'Thousand '; num %= 1000; }
  if (Math.floor(num / 100) > 0) { words += inWords(Math.floor(num / 100)) + 'Hundred '; num %= 100; }
  if (num > 0) { words += inWords(num); }
  return 'Rupees ' + words.trim() + ' Only';
}

export default function Invoices() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('list') // 'list', 'create', 'edit'
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [editing, setEditing] = useState(null)
  const [pdfUrl, setPdfUrl] = useState(null)
  const [selectedQuotationId, setSelectedQuotationId] = useState('')
  
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
    queryKey: ['customers'],
    queryFn: async () => {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/customers`, { headers });
      if (!res.ok) throw new Error('Failed to fetch clients');
      return res.json();
    }
  })

  const { data: quotations = [] } = useQuery({
    queryKey: ['quotations'],
    queryFn: async () => {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/quotations`, { headers });
      if (!res.ok) throw new Error('Failed to fetch quotations');
      return res.json();
    }
  })

  const [isManualClient, setIsManualClient] = useState(false);
  const [manualClient, setManualClient] = useState({ name: '', address: '', phone: '', panNumber: '', gstNumber: '' });

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
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to save invoice (HTTP ${res.status})`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      alert("Invoice saved successfully!");
      setActiveTab('list')
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
    onMutate: async (newStatus) => {
      await queryClient.cancelQueries({ queryKey: ['invoices'] })
      const previousInvoices = queryClient.getQueryData(['invoices'])
      queryClient.setQueryData(['invoices'], old => 
        old ? old.map(inv => inv.id === newStatus.id ? { ...inv, status: newStatus.status } : inv) : []
      )
      return { previousInvoices }
    },
    onError: (err, newStatus, context) => {
      if (context?.previousInvoices) {
        queryClient.setQueryData(['invoices'], context.previousInvoices)
      }
      alert("Failed to update status: " + err.message)
    },
    onSettled: () => {
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
    setSelectedQuotationId('')
    setIsManualClient(false)
    setManualClient({ name: '', address: '', phone: '', panNumber: '', gstNumber: '' })
    setForm({
      clientId: '',
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
    setActiveTab('create')
  }

  const handleImportFromQuotation = (quotationId) => {
    setSelectedQuotationId(quotationId)
    if (!quotationId) return
    const qt = quotations.find(q => q.id === quotationId)
    if (!qt) return
    const client = clients.find(c => c.id === qt.customerId)
    setIsManualClient(false)
    setForm(f => ({
      ...f,
      clientId: qt.customerId || '',
      panNo: client?.panNo || f.panNo,
      items: qt.items?.length > 0
        ? qt.items.map(i => ({
            description: i.description || '',
            hsnSac: i.hsnSac || '',
            quantity: i.quantity || 1,
            rate: i.rate || '',
            cgstRatePct: i.cgstRatePct ?? 9,
            sgstRatePct: i.sgstRatePct ?? 9,
          }))
        : f.items,
      notes: qt.notes || f.notes,
    }))
  }

  const openEdit = (invoice) => {
    setEditing(invoice)
    setIsManualClient(false)
    setManualClient({ name: '', address: '', phone: '', panNumber: '', gstNumber: '' })
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

  // Frontend calculation
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
  const amountInWords = numberToWords(Math.round(total));

  const buildPayload = () => {
    return {
      ...form,
      clientId: isManualClient ? 'MANUAL' : form.clientId,
      manualClient: isManualClient ? manualClient : undefined
    };
  }

  const handleSave = () => {
    if (!isManualClient && !form.clientId) {
      alert("Please select a client.");
      return;
    }
    if (isManualClient && !manualClient.name) {
      alert("Please enter a client name.");
      return;
    }
    if (!form.invoiceNumber) {
      alert("Please provide an invoice number.");
      return;
    }
    
    saveMutation.mutate(buildPayload())
  }

  const handlePreview = async () => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/invoices/preview`, {
        method: 'POST',
        headers,
        body: JSON.stringify(buildPayload())
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
    if(!confirm("Are you sure you want to delete this invoice?")) return;
    deleteMutation.mutate(id)
  }

  const handleViewPdf = async (id) => {
    try {
      const headers = await getAuthHeader();
      delete headers['Content-Type'];

      const res = await fetch(`${API_URL}/invoices/${id}/pdf`, {
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

  const handleDownloadPdf = async (id, invoiceNumber) => {
    try {
      const headers = await getAuthHeader();
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
      
      const binaryString = window.atob(data.pdf);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanNum = (invoiceNumber || '').trim().replace(/[/\\?%*:|"<>]/g, '-');
      const fallbackName = cleanNum
        ? (cleanNum.toLowerCase().startsWith('inv') ? `${cleanNum}.pdf` : `Invoice-${cleanNum}.pdf`)
        : 'Invoice.pdf';
      a.download = data.filename || fallbackName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("An error occurred while downloading PDF: " + (e.message || String(e)));
    }
  }

  if (activeTab === 'create' || activeTab === 'edit') {
    return (
      <div className="w-full max-w-5xl mx-auto pb-12">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setActiveTab('list')} className="p-2.5 rounded-lg bg-white shadow-sm border border-gray-200 hover:bg-gray-50 text-gray-700 transition-all">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-display text-4xl font-extrabold text-gray-900 tracking-tight">
            {activeTab === 'edit' ? 'Edit invoice' : 'New invoice'}
          </h1>
        </div>

        <div className="bg-white shadow-sm border border-gray-200 rounded-3xl p-6 sm:p-10 space-y-8">

          {/* Import from Quotation */}
          {activeTab === 'create' && (
            <div className="space-y-3 p-4 bg-black/5 border border-black/20 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <FileDown size={15} className="text-black" />
                <h3 className="text-sm font-semibold text-black uppercase tracking-widest">Import from Quotation</h3>
              </div>
              <p className="text-xs text-gray-500 mb-2">Select an existing quotation to auto-fill client and line items. You can edit everything after importing.</p>
              <select
                value={selectedQuotationId}
                onChange={e => handleImportFromQuotation(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-sm font-normal text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none"
              >
                <option value="" className="bg-white text-gray-900">Select a quotation to import</option>
                {quotations.map(qt => (
                  <option key={qt.id} value={qt.id} className="bg-white text-gray-900">
                    {qt.quoteNo} - {qt.customer?.name} {qt.status !== 'ACCEPTED' ? `(${qt.status})` : ''}
                  </option>
                ))}
              </select>
              {selectedQuotationId && (
                <p className="text-xs text-black mt-1">Quotation imported. Client and line items have been filled in below.</p>
              )}
            </div>
          )}

          {/* Top Meta */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Invoice #</label>
                <input placeholder="e.g. INV-001" value={form.invoiceNumber} onChange={e => setForm({...form, invoiceNumber: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-sm font-normal text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Issue Date</label>
                <input type="date" value={form.issueDate} onChange={e => setForm({...form, issueDate: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-sm font-normal text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Terms</label>
                <input placeholder="e.g. Due on Receipt" value={form.terms} onChange={e => setForm({...form, terms: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-sm font-normal text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Due Date</label>
                <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-sm font-normal text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Place of Supply</label>
                <input value={form.placeOfSupply} onChange={e => setForm({...form, placeOfSupply: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-sm font-normal text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="e.g. Tamil Nadu (33)" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">PAN No</label>
                <input placeholder="e.g. ABCDE1234F" value={form.panNo} onChange={e => setForm({...form, panNo: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-sm font-normal text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          {/* Client Details */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Bill To (Client)</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Manual Entry</span>
                <button
                  type="button"
                  onClick={() => setIsManualClient(!isManualClient)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isManualClient ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${isManualClient ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
            
            {!isManualClient ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Select Existing Client *</label>
                    <select value={form.clientId} onChange={e => {
                      const clientId = e.target.value;
                      const selectedClient = clients.find(c => c.id === clientId);
                      setForm({...form,
                        clientId,
                        panNo: selectedClient?.panNo || '',
                      });
                    }} className="w-full px-4 py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-sm font-normal text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none">
                      <option value="" className="bg-white text-gray-900">Select Client</option>
                      {clients.map(c => <option key={c.id} value={c.id} className="bg-white text-gray-900">{c.name}</option>)}
                    </select>
                  </div>
                </div>
                {/* Show selected client's details as read-only preview */}
                {form.clientId && (() => {
                  const sc = clients.find(c => c.id === form.clientId);
                  return sc ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                      {sc.email && <div><p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Email</p><p className="text-xs text-gray-700 mt-0.5 truncate">{sc.email}</p></div>}
                      {sc.phone && <div><p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Phone</p><p className="text-xs text-gray-700 mt-0.5">{sc.phone}</p></div>}
                      {sc.gstNumber && <div><p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">GSTIN</p><p className="text-xs text-gray-700 mt-0.5">{sc.gstNumber}</p></div>}
                      {sc.panNo && <div><p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">PAN</p><p className="text-xs text-gray-700 mt-0.5">{sc.panNo}</p></div>}
                      {sc.address && <div className="col-span-2 md:col-span-4"><p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Address</p><p className="text-xs text-gray-700 mt-0.5">{sc.address}</p></div>}
                    </div>
                  ) : null;
                })()}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Client Name *</label>
                  <input value={manualClient.name} onChange={e => setManualClient({...manualClient, name: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-sm font-normal text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="e.g. Acme Corp" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Phone</label>
                  <input placeholder="e.g. +91 98765 43210" value={manualClient.phone} onChange={e => setManualClient({...manualClient, phone: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-sm font-normal text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">GSTIN</label>
                  <input placeholder="e.g. 29ABCDE1234F1Z5" value={manualClient.gstNumber} onChange={e => setManualClient({...manualClient, gstNumber: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-sm font-normal text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Billing Address</label>
                  <textarea placeholder="Enter complete billing address" value={manualClient.address} onChange={e => setManualClient({...manualClient, address: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-sm font-normal text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none h-12" />
                </div>
              </div>
            )}
          </div>

          {/* Ship To Details */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest pb-2">Ship To (Optional)</h3>
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Shipping Address</label>
              <textarea value={form.shipAddress} onChange={e => setForm({...form, shipAddress: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-sm font-normal text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none h-16" placeholder="Leave blank to use Billing Address" />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest pb-2">Line Items</h3>
            <div className="pb-4">
              <div className="w-full">
                {/* Headers */}
                <div className="hidden md:grid grid-cols-12 gap-3 mb-2 text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                  <div className="col-span-3">Description</div>
                  <div className="col-span-2">HSN/SAC</div>
                  <div className="col-span-1 text-center">Qty</div>
                  <div className="col-span-2 text-right">Rate (₹)</div>
                  <div className="col-span-1 text-center">CGST %</div>
                  <div className="col-span-1 text-center">SGST %</div>
                  <div className="col-span-2 text-right pr-10">Amount (₹)</div>
                </div>
                {form.items.map((item, i) => (
                  <div key={i}>
                    {/* Mobile card */}
                    <div className="md:hidden bg-gray-50 border border-gray-200 rounded-xl p-3 mb-3 space-y-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">Item {i + 1}</span>
                        {form.items.length > 1 && (
                          <button onClick={() => removeItem(i)} className="text-slate-400 hover:text-red-500 p-1 rounded transition-all"><X size={14} /></button>
                        )}
                      </div>
                      <input placeholder="Description" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-normal text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                      <input placeholder="HSN/SAC" value={item.hsnSac} onChange={e => updateItem(i, 'hsnSac', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-normal text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                      <div className="grid grid-cols-2 gap-2">
                        <div><label className="text-[10px] font-bold text-slate-500 uppercase">Qty</label><input type="number" value={item.quantity === '' ? '' : item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value.replace(/^0+(?=\d)/, ''))} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-normal text-gray-900 placeholder:text-gray-400 text-center focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></div>
                        <div><label className="text-[10px] font-bold text-slate-500 uppercase">Rate (₹)</label><input type="number" value={item.rate === '' ? '' : item.rate} onChange={e => updateItem(i, 'rate', e.target.value.replace(/^0+(?=\d)/, ''))} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-normal text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div><label className="text-[10px] font-bold text-slate-500 uppercase">CGST %</label><input type="number" value={item.cgstRatePct === '' ? '' : item.cgstRatePct} onChange={e => updateItem(i, 'cgstRatePct', e.target.value.replace(/^0+(?=\d)/, ''))} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-normal text-gray-900 placeholder:text-gray-400 text-center focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></div>
                        <div><label className="text-[10px] font-bold text-slate-500 uppercase">SGST %</label><input type="number" value={item.sgstRatePct === '' ? '' : item.sgstRatePct} onChange={e => updateItem(i, 'sgstRatePct', e.target.value.replace(/^0+(?=\d)/, ''))} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-normal text-gray-900 placeholder:text-gray-400 text-center focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" /></div>
                      </div>
                      <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-200">
                        <span className="text-xs font-bold text-slate-500 uppercase">Amount</span>
                        <span className="text-sm font-semibold text-gray-900">₹{(item.quantity * item.rate).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    {/* Desktop grid row */}
                    <div className="hidden md:grid grid-cols-12 gap-3 mb-3 items-center">
                      <input placeholder="Description" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} className="col-span-3 px-4 py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-sm font-normal text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                      <input placeholder="HSN/SAC" value={item.hsnSac} onChange={e => updateItem(i, 'hsnSac', e.target.value)} className="col-span-2 px-4 py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-sm font-normal text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                      <input type="number" placeholder="Qty" value={item.quantity === '' ? '' : item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value.replace(/^0+(?=\d)/, ''))} className="col-span-1 px-4 py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-sm font-normal text-gray-900 placeholder:text-gray-400 text-center focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                      <input type="number" placeholder="Rate" value={item.rate === '' ? '' : item.rate} onChange={e => updateItem(i, 'rate', e.target.value.replace(/^0+(?=\d)/, ''))} className="col-span-2 px-4 py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-sm font-normal text-gray-900 placeholder:text-gray-400 text-right focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                      <input type="number" placeholder="CGST %" value={item.cgstRatePct === '' ? '' : item.cgstRatePct} onChange={e => updateItem(i, 'cgstRatePct', e.target.value.replace(/^0+(?=\d)/, ''))} className="col-span-1 px-4 py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-sm font-normal text-gray-900 placeholder:text-gray-400 text-center focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                      <input type="number" placeholder="SGST %" value={item.sgstRatePct === '' ? '' : item.sgstRatePct} onChange={e => updateItem(i, 'sgstRatePct', e.target.value.replace(/^0+(?=\d)/, ''))} className="col-span-1 px-4 py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-sm font-normal text-gray-900 placeholder:text-gray-400 text-center focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                      <div className="col-span-2 flex items-center justify-end pr-10 relative">
                        <span className="text-base font-semibold text-gray-900">{(item.quantity * item.rate).toLocaleString('en-IN')}</span>
                        {form.items.length > 1 && (
                          <button onClick={() => removeItem(i)} className="absolute right-0 text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all"><X size={16} /></button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={addItem} className="mt-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl w-full py-4 transition-all">
                  + Add Line Item
                </button>
              </div>
            </div>
          </div>

          {/* Totals & Words */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 space-y-4">
            <div className="flex flex-col md:flex-row justify-between gap-8">
              <div className="flex-1">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Amount in Words</h4>
                <p className="text-sm text-gray-900 font-medium leading-relaxed">{amountInWords}</p>
              </div>
              <div className="flex-1 min-w-[250px] space-y-3">
                <div className="flex justify-between text-base">
                  <span className="text-gray-700 font-medium">Subtotal</span>
                  <span className="text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-gray-700 font-medium">CGST Total</span>
                  <span className="text-gray-900">₹{totalCgst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-gray-700 font-medium">SGST Total</span>
                  <span className="text-gray-900">₹{totalSgst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-2xl font-bold border-t border-gray-200 pt-4 mt-2">
                  <span className="text-gray-900">Total</span>
                  <span className="text-blue-600">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status & Notes */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest pb-2">Status & Notes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Status</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-sm font-normal text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none">
                  <option value="PAID">PAID</option>
                  <option value="UNPAID">UNPAID</option>
                  <option value="OVERDUE">OVERDUE</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">Notes</label>
                <textarea placeholder="e.g. Thank you for your business!" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full px-4 py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-sm font-normal text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none h-14" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-12 pt-8 border-t border-gray-200">
            <button onClick={() => setActiveTab('list')} className="px-8 py-4 text-base font-semibold text-gray-700 bg-white border border-gray-300 shadow-sm rounded-xl hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button disabled={saveMutation.isPending} onClick={handleSave} className="px-8 py-4 text-base font-semibold text-white bg-blue-600 rounded-xl shadow-sm hover:bg-blue-700 transition-all disabled:opacity-50">
              {editing ? 'Save Invoice Changes' : 'Generate invoice'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (pdfUrl) {
    return (
      <div className="flex-1 flex flex-col p-8 bg-black">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white tracking-tight">PDF Viewer</h1>
          <button onClick={() => setPdfUrl(null)} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all">
            Back
          </button>
        </div>
        <div className="flex-1 bg-white rounded-2xl overflow-hidden shadow-2xl">
          <iframe src={pdfUrl} className="w-full h-full border-0" title="PDF Preview" />
        </div>
      </div>
    );
  }

  // LIST TAB
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl font-extrabold text-gray-900 tracking-tight">Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">{invoices.length} total invoices</p>
        </div>
        <div className="flex items-center w-full sm:w-auto gap-3">
          <button className="flex items-center justify-center sm:justify-start gap-2 px-5 py-2.5 bg-blue-600 text-white shadow-sm text-sm font-semibold rounded-xl hover:bg-blue-700 hover:shadow transition-all w-full sm:w-auto" onClick={openNew}>
            <Plus size={16} /> New Invoice
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
        <div className="relative flex-1 w-full max-w-none lg:max-w-md">
          <Search size={16} className="absolute top-3.5 left-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by invoice #..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 shadow-sm rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Invoice #</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Customer</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Amount</th>
                <th className="text-center px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Date</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingInvoices || isLoadingClients ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
                      <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </td>
                </tr>
              ) : isErrorInvoices || isErrorClients ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-red-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle size={24} />
                      <p className="text-sm">Failed to load invoices. Please try refreshing.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {filtered.map((inv) => (
                    <tr key={inv.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">{inv.invoiceNumber}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{inv.client?.name}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-semibold text-gray-900">₹{(inv.total || 0).toLocaleString('en-IN')}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <select
                          value={inv.status}
                          onChange={(e) => updateStatusMutation.mutate({ id: inv.id, status: e.target.value })}
                          className={`inline-block px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold appearance-none cursor-pointer outline-none shadow-sm border border-transparent hover:border-gray-300 ${STATUS_COLORS[inv.status] || STATUS_COLORS.UNPAID}`}
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
                        {new Date(inv.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleDownloadPdf(inv.id, inv.invoiceNumber)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all" title="Download PDF">
                            <Download size={16} />
                          </button>
                          <button onClick={() => openEdit(inv)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all" title="Edit">
                            <Edit3 size={16} />
                          </button>
                          <button onClick={() => handleDelete(inv.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-sm">
                        No invoices found
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
        {isLoadingInvoices || isLoadingClients ? (
          <div className="py-12 flex items-center justify-center gap-2 bg-white border border-gray-200 shadow-sm rounded-xl">
            <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
            <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        ) : isErrorInvoices || isErrorClients ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 bg-white border border-gray-200 shadow-sm rounded-xl text-red-500">
            <AlertCircle size={24} />
            <p className="text-sm">Failed to load invoices.</p>
          </div>
        ) : (
          <>
            {filtered.map((inv) => (
              <div key={inv.id} className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-sm font-semibold text-gray-900 tracking-wide">{inv.invoiceNumber}</span>
                    <p className="text-sm text-gray-500 mt-1">{inv.client?.name}</p>
                  </div>
                  <select
                    value={inv.status}
                    onChange={(e) => updateStatusMutation.mutate({ id: inv.id, status: e.target.value })}
                    className={`inline-block px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold appearance-none cursor-pointer outline-none shadow-sm border border-transparent hover:border-gray-300 ${STATUS_COLORS[inv.status] || STATUS_COLORS.UNPAID}`}
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
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Amount</p>
                    <span className="text-sm font-bold text-gray-900">₹{(inv.total || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Date</p>
                    <p className="text-sm text-gray-700">{new Date(inv.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200">
                  <button onClick={() => handleDownloadPdf(inv.id, inv.invoiceNumber)} className="flex-1 py-2 rounded-lg flex items-center justify-center gap-2 bg-gray-50 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all text-sm font-medium">
                    <Download size={16} /> <span className="hidden sm:inline">PDF</span>
                  </button>
                  <button onClick={() => openEdit(inv)} className="flex-1 py-2 rounded-lg flex items-center justify-center gap-2 bg-gray-50 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all text-sm font-medium">
                    <Edit3 size={16} /> <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button onClick={() => handleDelete(inv.id)} className="flex-1 py-2 rounded-lg flex items-center justify-center gap-2 bg-gray-50 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all text-sm font-medium">
                    <Trash2 size={16} /> <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="py-12 text-center text-gray-500 text-sm bg-white border border-gray-200 shadow-sm rounded-xl">
                No invoices found
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
