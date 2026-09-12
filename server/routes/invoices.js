const express = require('express');
const router = express.Router();
const { generateInvoicePdfStream } = require('../lib/pdfTemplate');
const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');
const { requireSupabaseAuth } = require('../middleware/auth');

const prisma = new PrismaClient();

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
      items,
    } = req.body;

    if (!clientId) {
      return res.status(400).json({ error: 'Please select a client.' });
    }
    if (!invoiceNumber || !String(invoiceNumber).trim()) {
      return res.status(400).json({ error: 'Please provide an invoice number.' });
    }

    let finalClientId = clientId;

    if (clientId === 'MANUAL' && req.body.manualClient) {
      const newCustomer = await prisma.customer.create({
        data: {
          name: req.body.manualClient.name || 'Unknown',
          phone: req.body.manualClient.phone || '',
          address: req.body.manualClient.address || '',
          gstNumber: req.body.manualClient.gstNumber || '',
          panNumber: req.body.manualClient.panNumber || ''
        }
      });
      finalClientId = newCustomer.id;
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one line item is required.' });
    }

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
        description: item.description || '',
        hsnSac: item.hsnSac || '',
        quantity,
        unitPrice: rate,
        total: amount,
        cgstRatePct,
        sgstRatePct,
      };
    });

    const total = subtotal + cgstAmountTotal + sgstAmountTotal;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNo: invoiceNumber,
        customerId: finalClientId,
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        terms: terms || 'Due on Receipt',
        panNo: panNo || '',
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
    require('fs').appendFileSync('error.log', new Date().toISOString() + ' Invoice Error: ' + (error?.stack || error) + '\n');
    console.error('Invoice Creation Error:', error);
    if (error?.code === 'P2002') {
      return res.status(409).json({ error: 'An invoice with this invoice number already exists.' });
    }
    if (error?.code === 'P2003') {
      return res.status(400).json({ error: 'The selected client no longer exists. Please select it again.' });
    }
    res.status(500).json({ error: 'Failed to create invoice: ' + (error?.message || String(error)) });
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
      panNo,
      placeOfSupply,
      shipAddress,
      notes,
      status,
    items,
    } = req.body;

    if (!clientId) {
      return res.status(400).json({ error: 'Please select a client.' });
    }
    if (!invoiceNumber || !String(invoiceNumber).trim()) {
      return res.status(400).json({ error: 'Please provide an invoice number.' });
    }

    let finalClientId = clientId;

    if (clientId === 'MANUAL' && req.body.manualClient) {
      const newCustomer = await prisma.customer.create({
        data: {
          name: req.body.manualClient.name || 'Unknown',
          phone: req.body.manualClient.phone || '',
          address: req.body.manualClient.address || '',
          gstNumber: req.body.manualClient.gstNumber || '',
          panNumber: req.body.manualClient.panNumber || ''
        }
      });
      finalClientId = newCustomer.id;
    }

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
        customerId: finalClientId,
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        terms: terms || 'Due on Receipt',
        panNo: panNo || '',
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

// Preview PDF (before save)
router.post('/preview', requireSupabaseAuth, async (req, res) => {
  try {
    const payload = req.body;
    
    let client = {};
    if (payload.clientId === 'MANUAL' && payload.manualClient) {
      client = {
        name: payload.manualClient.name || 'Unknown',
        billAddress: payload.manualClient.address || '',
        phone: payload.manualClient.phone || '',
        gstNumber: payload.manualClient.gstNumber || '',
        panNo: payload.manualClient.panNumber || ''
      };
    } else if (payload.clientId) {
      const dbClient = await prisma.customer.findUnique({ where: { id: payload.clientId } });
      if (dbClient) {
        client = {
          ...dbClient,
          billAddress: dbClient.address,
          panNo: dbClient.panNumber
        };
      }
    }

    let subtotal = 0;
    let cgstAmountTotal = 0;
    let sgstAmountTotal = 0;

    const items = (payload.items || []).map(item => {
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
        ...item,
        rate,
        amount,
        cgstAmount: itemCgst,
        sgstAmount: itemSgst
      };
    });

    const total = subtotal + cgstAmountTotal + sgstAmountTotal;

    const invoiceObj = {
      invoiceNumber: payload.invoiceNumber || 'PREVIEW',
      issueDate: payload.issueDate || new Date(),
      dueDate: payload.dueDate || null,
      terms: payload.terms || 'Due on Receipt',
      placeOfSupply: payload.placeOfSupply || 'Tamil Nadu (33)',
      shipAddress: payload.shipAddress || client.billAddress,
      subtotal,
      cgstAmount: cgstAmountTotal,
      sgstAmount: sgstAmountTotal,
      total,
      balanceDue: total,
      client,
      items
    };

    const settingsData = await prisma.setting.findMany();
    const settings = {};
    settingsData.forEach(s => settings[s.key] = s.value);

    const pdfStream = await generateInvoicePdfStream(invoiceObj, settings);

    const chunks = [];
    pdfStream.on('data', (chunk) => chunks.push(chunk));
    pdfStream.on('end', () => {
      const result = Buffer.concat(chunks);
      res.json({ pdf: result.toString('base64') });
    });
    pdfStream.on('error', (err) => {
      console.error('Error generating PDF preview:', err);
      res.status(500).json({ error: 'Failed to generate PDF preview' });
    });
  } catch (error) {
    console.error('Invoice Preview Error:', error);
    res.status(500).json({ error: 'Internal server error generating preview' });
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
      const rawNum = (inv.invoiceNo || invoice.invoiceNumber || '').trim();
      const cleanNum = rawNum.replace(/[/\\?%*:|"<>]/g, '-');
      const filename = cleanNum
        ? (cleanNum.toLowerCase().startsWith('inv') ? `${cleanNum}.pdf` : `Invoice-${cleanNum}.pdf`)
        : 'Invoice.pdf';
      res.json({
        success: true,
        pdf: result.toString('base64'),
        filename
      });
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
