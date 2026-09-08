import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { IndianRupee, FileText, Users, Package, TrendingUp, Clock, AlertCircle } from 'lucide-react'
import logoUrl from '../assets/shapio-logo.png'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-lg px-4 py-3 shadow-xl">
        <p className="text-xs text-white/70">{label}</p>
        <p className="text-sm font-semibold text-white mt-1">
          ₹{payload[0].value.toLocaleString('en-IN')}
        </p>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/dashboard`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      return res.json();
    }
  })

  if (isLoading || !data) {
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
        <p className="text-sm">Failed to load dashboard data. Please try refreshing.</p>
      </div>
    )
  }

  const { stats, recentInvoices, recentCustomers } = data || {
    stats: { totalRevenue: 0, pendingInvoices: 0, totalCustomers: 0, totalProducts: 0, monthlyRevenue: [], invoicesByStatus: [] },
    recentInvoices: [],
    recentCustomers: []
  }

  const STAT_CARDS = [
    {
      label: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`,
      icon: IndianRupee,
      change: 'Lifetime',
      positive: true,
    },
    {
      label: 'Pending Invoices',
      value: stats.pendingInvoices,
      icon: FileText,
      change: `${stats.pendingInvoices} unpaid`,
      positive: stats.pendingInvoices === 0,
    },
    {
      label: 'Total Customers',
      value: stats.totalCustomers,
      icon: Users,
      change: 'Registered',
      positive: true,
    },
    {
      label: 'Active Products',
      value: stats.totalProducts,
      icon: Package,
      change: 'Available',
      positive: true,
    },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white tracking-wide">Dashboard</h1>
          <p className="text-sm text-k-silver-dim mt-1">Welcome back. Here's your business overview.</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {STAT_CARDS.map((stat, i) => (
          <div
            key={i}
            className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-white/30 transition-all group shadow-2xl shadow-black/20"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-white/30 transition-colors">
                <stat.icon size={20} className="text-white/80 group-hover:text-white" />
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-md ${
                stat.positive
                  ? 'text-emerald-400 bg-emerald-400/[0.08]'
                  : 'text-amber-400 bg-amber-400/[0.08]'
              }`}>
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-white font-display">{stat.value}</p>
            <p className="text-xs text-k-silver-dim mt-1 uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-black/20 backdrop-blur-md border border-white/10 shadow-2xl shadow-black/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-white">Monthly Revenue</h3>
              <p className="text-xs text-white/60 mt-0.5">Current Overview</p>
            </div>
            <TrendingUp size={18} className="text-white/60" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyRevenue} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                <XAxis dataKey="month" stroke="#707070" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#707070" fontSize={11} tickLine={false} axisLine={false}
                  tickFormatter={(v) => v >= 1000 ? `₹${(v / 1000).toFixed(1)}k` : `₹${v}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar 
                  dataKey="revenue" 
                  fill="url(#barGloss)" 
                  radius={[6, 6, 0, 0]} 
                  isAnimationActive={true}
                  animationDuration={1800}
                  animationEasing="ease-out"
                />
                <defs>
                  <linearGradient id="barGloss" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#39FF14" stopOpacity={1} />
                    <stop offset="25%" stopColor="#048a4c" stopOpacity={0.8} />
                    <stop offset="60%" stopColor="#025732" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#01351D" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Invoice status pie */}
        <div className="bg-black/20 backdrop-blur-md border border-white/10 shadow-2xl shadow-black/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-white">Invoice Status</h3>
              <p className="text-xs text-white/60 mt-0.5">Current distribution</p>
            </div>
            <FileText size={18} className="text-white/60" />
          </div>
          <div className="h-48">
            {stats.invoicesByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.invoicesByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                    isAnimationActive={true}
                    animationDuration={1800}
                    animationEasing="ease-out"
                  >
                    {stats.invoicesByStatus.map((entry, index) => (
                      <Cell 
                        key={index} 
                        fill={entry.color} 
                        style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.4))' }} 
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(0,0,0,0.6)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#f5f5f5',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-k-silver-dim text-sm">No Invoice Data</div>
            )}
          </div>
          {/* Legend */}
          <div className="flex items-center justify-center gap-5 mt-2">
            {stats.invoicesByStatus.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                <span className="text-xs text-k-silver-dim">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent invoices */}
        <div className="bg-black/20 backdrop-blur-md border border-white/10 shadow-2xl shadow-black/20 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Recent Invoices</h3>
          <div className="space-y-3">
            {recentInvoices.length > 0 ? recentInvoices.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between px-4 py-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                    <FileText size={16} className="text-k-silver-dim" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{inv.invoiceNo}</p>
                    <p className="text-xs text-k-silver-dim">Customer ID: {inv.customerId.slice(0, 8)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">₹{Number(inv.totalAmount || 0).toLocaleString('en-IN')}</p>
                  <span className={`text-[10px] uppercase tracking-wider font-medium ${
                    inv.status === 'PAID' ? 'text-emerald-400' :
                    inv.status === 'UNPAID' ? 'text-amber-400' :
                    'text-red-400'
                  }`}>
                    {inv.status}
                  </span>
                </div>
              </div>
            )) : <p className="text-sm text-k-silver-dim">No recent invoices.</p>}
          </div>
        </div>

        {/* Recent customers */}
        <div className="bg-black/20 backdrop-blur-md border border-white/10 shadow-2xl shadow-black/20 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Recent Customers</h3>
          <div className="space-y-3">
            {recentCustomers.length > 0 ? recentCustomers.map((cust) => (
              <div
                key={cust.id}
                className="flex items-center justify-between px-4 py-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-k-silver/20 to-k-border flex items-center justify-center">
                    <span className="text-xs font-bold text-k-silver">{(cust.name || 'C').charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{cust.name}</p>
                    <p className="text-xs text-k-silver-dim">{cust.company || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-k-silver-dim">
                  <Clock size={12} />
                  {new Date(cust.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            )) : <p className="text-sm text-k-silver-dim">No recent customers.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
