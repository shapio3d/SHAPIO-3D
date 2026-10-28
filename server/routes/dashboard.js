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

    const round2 = (val) => Math.round((Number(val) || 0) * 100) / 100;

    // Calculate stats
    let totalRevenue = 0; // Paid amount
    let totalPaidAmount = 0;
    let totalPendingAmount = 0;
    let pendingInvoices = 0;
    let statusCounts = { PAID: 0, UNPAID: 0, OVERDUE: 0, CANCELLED: 0 };

    invoices.forEach(inv => {
      const amt = Number(inv.totalAmount) || 0;
      if (inv.status === 'PAID') {
        totalRevenue += amt;
        totalPaidAmount += amt;
      } else if (inv.status === 'UNPAID' || inv.status === 'OVERDUE') {
        totalPendingAmount += amt;
        pendingInvoices++;
      }
      if (statusCounts[inv.status] !== undefined) {
        statusCounts[inv.status]++;
      }
    });

    totalRevenue = round2(totalRevenue);
    totalPaidAmount = round2(totalPaidAmount);
    totalPendingAmount = round2(totalPendingAmount);
    const totalInvoicedAmount = round2(totalPaidAmount + totalPendingAmount);

    // Pie chart data
    const invoicesByStatus = [];
    if (statusCounts.PAID > 0) invoicesByStatus.push({ name: 'Paid', value: statusCounts.PAID, color: '#10b981' });
    if (statusCounts.UNPAID > 0) invoicesByStatus.push({ name: 'Unpaid', value: statusCounts.UNPAID, color: '#f59e0b' });
    if (statusCounts.OVERDUE > 0) invoicesByStatus.push({ name: 'Overdue', value: statusCounts.OVERDUE, color: '#ef4444' });

    // Monthly revenue (current month)
    const currentMonth = new Date().toLocaleString('default', { month: 'short' });
    const monthlyRevenue = [{ month: currentMonth, revenue: totalRevenue }];

    // Recent invoices
    const recentInvoices = invoices.slice(0, 5).map(inv => ({
      id: inv.id,
      invoiceNo: inv.invoiceNo,
      customerId: inv.customerId,
      customerName: inv.customer?.name || 'Unknown',
      totalAmount: round2(inv.totalAmount),
      status: inv.status,
      createdAt: inv.createdAt
    }));

    // Customer financial summary for all customers
    const allCustomers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        invoices: {
          select: {
            id: true,
            invoiceNo: true,
            totalAmount: true,
            status: true,
            issueDate: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    const customerFinancials = allCustomers.map(cust => {
      let custPaid = 0;
      let custPending = 0;
      let custPaidCount = 0;
      let custPendingCount = 0;

      (cust.invoices || []).forEach(inv => {
        const amt = Number(inv.totalAmount) || 0;
        if (inv.status === 'PAID') {
          custPaid += amt;
          custPaidCount++;
        } else if (inv.status === 'UNPAID' || inv.status === 'OVERDUE') {
          custPending += amt;
          custPendingCount++;
        }
      });

      custPaid = round2(custPaid);
      custPending = round2(custPending);

      return {
        id: cust.id,
        name: cust.name,
        company: cust.company || '',
        phone: cust.phone || '',
        email: cust.email || '',
        billAddress: cust.address || '',
        totalAmount: round2(custPaid + custPending),
        paidAmount: custPaid,
        pendingAmount: custPending,
        invoicesCount: (cust.invoices || []).length,
        paidInvoicesCount: custPaidCount,
        pendingInvoicesCount: custPendingCount,
        createdAt: cust.createdAt,
        invoices: (cust.invoices || []).map(i => ({
          id: i.id,
          invoiceNo: i.invoiceNo,
          totalAmount: round2(i.totalAmount),
          status: i.status,
          issueDate: i.issueDate,
          createdAt: i.createdAt
        }))
      };
    });

    res.json({
      stats: {
        totalRevenue,
        totalPaidAmount,
        totalPendingAmount,
        totalInvoicedAmount,
        pendingInvoices,
        totalCustomers: customerCount,
        totalProducts: productCount,
        monthlyRevenue,
        invoicesByStatus
      },
      recentInvoices,
      recentCustomers: customerFinancials.slice(0, 5),
      customerFinancials
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    next(error);
  }
});

module.exports = router;
