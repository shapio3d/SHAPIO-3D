const express = require('express');
const router = express.Router();
const { generateInvoicePdfStream } = require('../lib/pdfTemplate');
const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Initialize a generic client to verify user tokens
const supabaseAuthClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Supabase Auth Middleware
const tokenCache = new Map();

const requireSupabaseAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const token = authHeader.split(' ')[1];
  
  if (tokenCache.has(token)) {
    req.user = tokenCache.get(token);
    return next();
  }
  
  const { data: { user }, error } = await supabaseAuthClient.auth.getUser(token);
  if (error || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  
  tokenCache.set(token, user);
  setTimeout(() => tokenCache.delete(token), 60 * 1000); // 1m cache
  
  req.user = user;
  next();
};

// Get All Invoices
router.get('/', requireSupabaseAuth, async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        items: true
      }
    });

    const mapped = invoices.map(inv => ({
      ...inv,
      invoiceNumber: inv.invoiceNo,
      clientId: inv.customerId,
      total: Number(inv.totalAmount),
      subtotal: Number(inv.subtotal),
      cgstAmount: Number(inv.cgstAmount),
      sgstAmount: Number(inv.sgstAmount),
      client: {
        ...inv.customer,
        billAddress: inv.customer.address,
        panNo: inv.customer.panNumber
      },
      items: inv.items.map(i => ({
        ...i,
        rate: Number(i.unitPrice),
        amount: Number(i.total)
      }))
    }));

    res.json(mapped);
  } catch (error) {
    console.error('Fetch Invoices Error:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Delete Invoice
router.delete('/:id', requireSupabaseAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.invoice.delete({
      where: { id }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete Invoice Error:', error);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
});

// Create Invoice
router.post('/', requireSupabaseAuth, async (req, res) => {
  try {
    const { 
      clientId, 
      invoiceNumber, 
      issueDate, 
      dueDate, 
      terms, 
      placeOfSupply, 
      panNo, 
      shipAddress,
      notes,
      status,
      items 
    } = req.body;

    let subtotal = 0;
    let cgstAmountTotal = 0;
    let sgstAmountTotal = 0;

    const mappedItems = items.map(item => {
      const quantity = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      const amount = quantity * rate;
      const cgstRatePct = parseFloat(item.cgstRatePct) || 9;
      const sgstRatePct = parseFloat(item.sgstRatePct) || 9;
      
      const itemCgst = amount * (cgstRatePct / 100);
      const itemSgst = amount * (sgstRatePct / 100);

      subtotal += amount;
      cgstAmountTotal += itemCgst;
      sgstAmountTotal += itemSgst;

      return {
        description: item.description,
        hsnSac: item.hsnSac,
        quantity,
        unitPrice: rate,
        total: amount,
      };
    });

    const total = subtotal + cgstAmountTotal + sgstAmountTotal;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNo: invoiceNumber,
        customerId: clientId,
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        placeOfSupply,
        shipAddress,
        notes,
        subtotal,
        cgstAmount: cgstAmountTotal,
        sgstAmount: sgstAmountTotal,
        totalAmount: total,
        status: status || 'UNPAID',
        items: {
          create: mappedItems
        }
      },
      include: {
        items: true,
        customer: true
      }
    });

    res.status(201).json({ success: true, invoice });
  } catch (error) {
    console.error('Invoice Creation Error:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Update existing invoice
router.put('/:id', requireSupabaseAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      clientId,
      invoiceNumber,
      issueDate,
      dueDate,
      terms,
      placeOfSupply,
      shipAddress,
      notes,
      status,
      items
    } = req.body;

    let subtotal = 0;
    let cgstAmountTotal = 0;
    let sgstAmountTotal = 0;

    const mappedItems = items.map(item => {
      const quantity = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      const amount = quantity * rate;
      const cgstRatePct = parseFloat(item.cgstRatePct) || 9;
      const sgstRatePct = parseFloat(item.sgstRatePct) || 9;
      
      const itemCgst = amount * (cgstRatePct / 100);
      const itemSgst = amount * (sgstRatePct / 100);

      subtotal += amount;
      cgstAmountTotal += itemCgst;
      sgstAmountTotal += itemSgst;

      return {
        description: item.description,
        hsnSac: item.hsnSac,
        quantity,
        unitPrice: rate,
        total: amount,
      };
    });

    const total = subtotal + cgstAmountTotal + sgstAmountTotal;

    // Delete existing items
    await prisma.invoiceItem.deleteMany({
      where: { invoiceId: id }
    });

    // Update invoice and add new items
    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        invoiceNo: invoiceNumber,
        customerId: clientId,
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        placeOfSupply,
        shipAddress,
        notes,
        status,
        subtotal,
        cgstAmount: cgstAmountTotal,
        sgstAmount: sgstAmountTotal,
        totalAmount: total,
        items: {
          create: mappedItems
        }
      },
      include: {
        items: true,
        customer: true
      }
    });

    res.json({ success: true, invoice });
  } catch (error) {
    console.error('Invoice Update Error:', error);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

// Update invoice status (inline)
router.patch('/:id/status', requireSupabaseAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const invoice = await prisma.invoice.update({
      where: { id },
      data: { status }
    });

    res.json({ success: true, invoice });
  } catch (error) {
    console.error('Invoice Status Update Error:', error);
    res.status(500).json({ error: 'Failed to update invoice status' });
  }
});

// Download PDF
router.get('/:invoiceId/pdf', requireSupabaseAuth, async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const inv = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        customer: true,
        items: true
      }
    });

    if (!inv) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Map Prisma schema to PDF template expected schema
    const invoice = {
      ...inv,
      invoiceNumber: inv.invoiceNo,
      total: Number(inv.totalAmount),
      subtotal: Number(inv.subtotal),
      cgstAmount: Number(inv.cgstAmount),
      sgstAmount: Number(inv.sgstAmount),
      balanceDue: Number(inv.totalAmount),
      client: {
        ...inv.customer,
        billAddress: inv.customer.address,
        panNo: inv.customer.panNumber
      },
      items: inv.items.map(i => ({
        ...i,
        rate: Number(i.unitPrice),
        amount: Number(i.total),
        cgstRatePct: 9, // Fallback since Prisma schema doesn't store this per item
        sgstRatePct: 9,
        cgstAmount: Number(i.total) * 0.09,
        sgstAmount: Number(i.total) * 0.09
      }))
    };

    // Fetch settings
    const settingsData = await prisma.setting.findMany();
    const settings = {};
    settingsData.forEach(s => settings[s.key] = s.value);

    // Generate PDF stream
    const pdfStream = await generateInvoicePdfStream(invoice, settings);

    const chunks = [];
    pdfStream.on('data', (chunk) => chunks.push(chunk));
    pdfStream.on('end', () => {
      const result = Buffer.concat(chunks);
      res.json({ pdf: result.toString('base64') });
    });
    pdfStream.on('error', (err) => {
      console.error('Error generating PDF:', err);
      res.status(500).json({ error: 'Failed to generate PDF' });
    });
  } catch (error) {
    console.error('Invoice PDF Generation Error:', error);
    res.status(500).json({ error: 'Internal server error generating PDF' });
  }
});

module.exports = router;
