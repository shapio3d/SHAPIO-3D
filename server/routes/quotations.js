const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { requireSupabaseAuth } = require('../middleware/auth');
const { generateQuotationPdfStream } = require('../lib/pdfTemplate');
const fs = require('fs');
const path = require('path');

// GET /api/quotations
router.get('/', requireSupabaseAuth, async (req, res, next) => {
  try {
    const quotations = await prisma.quotation.findMany({
      include: {
        customer: true,
        items: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(quotations);
  } catch (error) {
    next(error);
  }
});

// POST /api/quotations
router.post('/', requireSupabaseAuth, async (req, res, next) => {
  try {
    const { quoteNo, customerId, items, status, validUntil, notes } = req.body;

    let totalAmount = 0;
    
    const mappedItems = items.map(item => {
      const quantity = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      const amount = quantity * rate;
      const cgstRatePct = parseFloat(item.cgstRatePct) || 9;
      const sgstRatePct = parseFloat(item.sgstRatePct) || 9;
      
      const cgstAmount = amount * (cgstRatePct / 100);
      const sgstAmount = amount * (sgstRatePct / 100);

      totalAmount += amount + cgstAmount + sgstAmount;

      return {
        description: item.description,
        hsnSac: item.hsnSac,
        quantity,
        rate,
        amount,
        cgstRatePct,
        cgstAmount,
        sgstRatePct,
        sgstAmount
      };
    });

    const newQuotation = await prisma.quotation.create({
      data: {
        quoteNo,
        customerId,
        totalAmount,
        status: status || 'DRAFT',
        validUntil: validUntil ? new Date(validUntil) : null,
        notes,
        items: {
          create: mappedItems
        }
      },
      include: {
        customer: true,
        items: true
      }
    });

    res.status(201).json(newQuotation);
  } catch (error) {
    next(error);
  }
});

// PUT /api/quotations/:id
router.put('/:id', requireSupabaseAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quoteNo, customerId, items, status, validUntil, notes } = req.body;

    let totalAmount = 0;
    
    const mappedItems = items.map(item => {
      const quantity = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      const amount = quantity * rate;
      const cgstRatePct = parseFloat(item.cgstRatePct) || 9;
      const sgstRatePct = parseFloat(item.sgstRatePct) || 9;
      
      const cgstAmount = amount * (cgstRatePct / 100);
      const sgstAmount = amount * (sgstRatePct / 100);

      totalAmount += amount + cgstAmount + sgstAmount;

      return {
        description: item.description,
        hsnSac: item.hsnSac,
        quantity,
        rate,
        amount,
        cgstRatePct,
        cgstAmount,
        sgstRatePct,
        sgstAmount
      };
    });

    // First delete existing items
    await prisma.quotationItem.deleteMany({
      where: { quotationId: id }
    });

    // Then update quotation and recreate items
    const updatedQuotation = await prisma.quotation.update({
      where: { id },
      data: {
        quoteNo,
        customerId,
        totalAmount,
        status,
        validUntil: validUntil ? new Date(validUntil) : null,
        notes,
        items: {
          create: mappedItems
        }
      },
      include: {
        customer: true,
        items: true
      }
    });

    res.json(updatedQuotation);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/quotations/:id/status
router.patch('/:id/status', requireSupabaseAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const updatedQuotation = await prisma.quotation.update({
      where: { id },
      data: { status }
    });
    
    res.json(updatedQuotation);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/quotations/:id
router.delete('/:id', requireSupabaseAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    // Prisma cascading deletes will handle items if configured, otherwise delete items first
    await prisma.quotationItem.deleteMany({
      where: { quotationId: id }
    });
    
    await prisma.quotation.delete({
      where: { id }
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// GET /api/quotations/:id/pdf
router.get('/:id/pdf', requireSupabaseAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true
      }
    });

    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    // Calculate subtotal, cgst, sgst like invoices
    const subtotal = quotation.items.reduce((sum, item) => sum + Number(item.amount), 0);
    const cgstAmount = quotation.items.reduce((sum, item) => sum + Number(item.cgstAmount), 0);
    const sgstAmount = quotation.items.reduce((sum, item) => sum + Number(item.sgstAmount), 0);
    
    // Add calculated fields to the object for the template
    const quotationWithTotals = {
      ...quotation,
      subtotal,
      cgstAmount,
      sgstAmount
    };

    let settings = {};
    const settingsPath = path.join(__dirname, '..', 'data', 'settings.json');
    if (fs.existsSync(settingsPath)) {
      settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    }

    const stream = await generateQuotationPdfStream(quotationWithTotals, settings);
    
    // Return Base64 JSON payload (matching invoices)
    const chunks = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => {
      const result = Buffer.concat(chunks);
      res.json({
        success: true,
        pdf: result.toString('base64'),
        filename: `Quotation_${quotation.quoteNo}.pdf`
      });
    });
    
    stream.on('error', err => {
      throw err;
    });

  } catch (error) {
    console.error('PDF Generation Error:', error);
    next(error);
  }
});

module.exports = router;
