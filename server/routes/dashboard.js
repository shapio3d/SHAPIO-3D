const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { requireSupabaseAuth } = require('../middleware/auth');

// GET /api/dashboard
router.get('/', requireSupabaseAuth, async (req, res, next) => {
  try {
    const [invoices, customerCount, productCount] = await Promise.all([
      prisma.invoice.findMany({
        orderBy: { createdAt: 'desc' },
        include: { customer: true }
      }),
      prisma.customer.count(),
      prisma.product.count({ where: { isActive: true } })
    ]);

    // Calculate stats
    let totalRevenue = 0;
    let pendingInvoices = 0;
    let statusCounts = { PAID: 0, UNPAID: 0, OVERDUE: 0, CANCELLED: 0 };

    invoices.forEach(inv => {
      if (inv.status === 'PAID') totalRevenue += Number(inv.totalAmount) || 0;
      if (inv.status === 'UNPAID') pendingInvoices++;
      if (statusCounts[inv.status] !== undefined) {
        statusCounts[inv.status]++;
      }
    });

    // Pie chart data
    const invoicesByStatus = [];
    if (statusCounts.PAID > 0) invoicesByStatus.push({ name: 'Paid', value: statusCounts.PAID, color: '#10b981' });
    if (statusCounts.UNPAID > 0) invoicesByStatus.push({ name: 'Unpaid', value: statusCounts.UNPAID, color: '#f59e0b' });
    if (statusCounts.OVERDUE > 0) invoicesByStatus.push({ name: 'Overdue', value: statusCounts.OVERDUE, color: '#ef4444' });

    // Monthly revenue (current month)
    const currentMonth = new Date().toLocaleString('default', { month: 'short' });
    const monthlyRevenue = [{ month: currentMonth, revenue: totalRevenue }];

    // Recent items
    const recentInvoices = invoices.slice(0, 4).map(inv => ({
      id: inv.id,
      invoiceNo: inv.invoiceNo,
      customerId: inv.customerId,
      customerName: inv.customer?.name || 'Unknown',
      totalAmount: Number(inv.totalAmount) || 0,
      status: inv.status,
      createdAt: inv.createdAt
    }));

    const recentCustomers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
      take: 4
    });

    res.json({
      stats: {
        totalRevenue,
        pendingInvoices,
        totalCustomers: customerCount,
        totalProducts: productCount,
        monthlyRevenue,
        invoicesByStatus
      },
      recentInvoices,
      recentCustomers
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    next(error);
  }
});

module.exports = router;
