import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { ArrowLeft, Search, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'https://server.shapio3d.com/api';

const getAuthHeader = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Authorization': `Bearer ${session?.access_token}`,
    'Content-Type': 'application/json'
  };
}

const formatINR = (val) => {
  const num = Number(val) || 0;
  return '₹' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function CustomerBalances() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL') // 'ALL' | 'PENDING' | 'SETTLED'

  const { data: rawCustomers = [], isLoading: isLoadingCustomers, isError: isErrorCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/customers`, { headers });
      if (!res.ok) throw new Error('Failed to fetch customers')
      return res.json();
    }
  })

  const { data: invoices = [], isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/invoices`, { headers });
      if (!res.ok) return [];
      return res.json();
    }
  })

  const round2 = (val) => Math.round((Number(val) || 0) * 100) / 100;

  // Merge customer data with invoices so balances are 100% accurate regardless of backend server state
  const customers = useMemo(() => {
    return (rawCustomers || []).map(cust => {
      // If backend already returned enriched data with invoices array and numeric balances
      if (typeof cust.paidAmount === 'number' && typeof cust.pendingAmount === 'number' && Array.isArray(cust.invoices) && cust.invoices.length > 0) {
        return cust;
      }

      // Compute client-side from invoices directly
      let paid = 0;
      let pending = 0;
      let paidCount = 0;
      let pendingCount = 0;

      const custInvoices = (invoices || []).filter(inv => inv.customerId === cust.id || inv.clientId === cust.id);

      custInvoices.forEach(inv => {
        const amt = Number(inv.totalAmount || inv.total) || 0;
        if (inv.status === 'PAID') {
          paid += amt;
          paidCount++;
        } else if (inv.status === 'UNPAID' || inv.status === 'OVERDUE') {
          pending += amt;
          pendingCount++;
        }
      });

      return {
        ...cust,
        paidAmount: round2(paid),
        pendingAmount: round2(pending),
        totalAmount: round2(paid + pending),
        invoicesCount: custInvoices.length,
        paidInvoicesCount: paidCount,
        pendingInvoicesCount: pendingCount,
        invoices: custInvoices
      };
    });
  }, [rawCustomers, invoices]);

  const totalPaid = round2(customers.reduce((sum, c) => sum + (Number(c.paidAmount) || 0), 0));
  const totalPending = round2(customers.reduce((sum, c) => sum + (Number(c.pendingAmount) || 0), 0));
  const pendingCount = customers.filter(c => (Number(c.pendingAmount) || 0) > 0).length;
  const settledCount = customers.length - pendingCount;

  const filtered = customers.filter(c => {
    const matchesSearch = 
      (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.company || '').toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;

    const pending = Number(c.pendingAmount) || 0;
    if (statusFilter === 'PENDING') return pending > 0;
    if (statusFilter === 'SETTLED') return pending <= 0;
    return true;
  })

  const isLoading = isLoadingCustomers || (isLoadingInvoices && rawCustomers.length > 0 && invoices.length === 0);
  const isError = isErrorCustomers;

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
        <p className="text-sm font-semibold text-gray-700">Failed to load customer balances. Please try refreshing.</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Top Navigation & Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-3 group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900 tracking-tight">Customer Balances</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Overview of paid revenue and pending dues per customer</p>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-gray-900">{filtered.length}</span> of {customers.length} customers
          </div>
        </div>
      </div>

      {/* Minimal KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Total Paid</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              <CheckCircle2 size={12} /> Settled
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-600 font-display tabular-nums tracking-tight">
            {formatINR(totalPaid)}
          </p>
        </div>

        <div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Total Pending</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              <AlertTriangle size={12} /> {pendingCount} with dues
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-amber-600 font-display tabular-nums tracking-tight">
            {formatINR(totalPending)}
          </p>
        </div>
      </div>

      {/* Controls: Search & Simple Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute top-3.5 left-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search customer name or company..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-gray-100/80 p-1 rounded-xl">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              statusFilter === 'ALL'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All ({customers.length})
          </button>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              statusFilter === 'PENDING'
                ? 'bg-white text-amber-700 shadow-sm'
                : 'text-gray-600 hover:text-amber-700'
            }`}
          >
            Pending Due ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('SETTLED')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              statusFilter === 'SETTLED'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-gray-600 hover:text-emerald-700'
            }`}
          >
            Settled ({settledCount})
          </button>
        </div>
      </div>

      {/* Neat, Minimal Customer Balances Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Customer Name
                </th>
                <th className="text-right px-6 py-4 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Paid Amount
                </th>
                <th className="text-right px-6 py-4 text-xs font-bold text-amber-700 uppercase tracking-wider">
                  Pending Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((cust) => {
                const paid = Number(cust.paidAmount) || 0;
                const pending = Number(cust.pendingAmount) || 0;
                const hasCompany = cust.company && cust.company.trim() !== '' && cust.company.trim().toLowerCase() !== (cust.name || '').trim().toLowerCase();

                return (
                  <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Customer Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200/80 flex-shrink-0">
                          {(cust.name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 leading-snug">
                            {cust.name}
                          </p>
                          {hasCompany && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              {cust.company}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Paid Amount */}
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-emerald-600 tabular-nums">
                        {formatINR(paid)}
                      </span>
                    </td>

                    {/* Pending Amount */}
                    <td className="px-6 py-4 text-right">
                      {pending > 0 ? (
                        <span className="text-sm font-bold text-amber-600 tabular-nums">
                          {formatINR(pending)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700">
                          Settled
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-400 text-sm">
                    No customers found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>

            {/* Clean Total Summary Footer */}
            {filtered.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-gray-100 bg-gray-50/50 font-semibold">
                  <td className="px-6 py-4 text-xs uppercase tracking-wider text-gray-600">
                    Total ({filtered.length} customers)
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-emerald-700 tabular-nums">
                    {formatINR(filtered.reduce((sum, c) => sum + (Number(c.paidAmount) || 0), 0))}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-amber-700 tabular-nums">
                    {formatINR(filtered.reduce((sum, c) => sum + (Number(c.pendingAmount) || 0), 0))}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  )
}
