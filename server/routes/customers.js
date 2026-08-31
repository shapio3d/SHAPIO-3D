const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const supabaseAuthClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

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

// GET all customers
router.get('/', requireSupabaseAuth, async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' }
    });
    // Map address to billAddress and panNumber to panNo to maintain compatibility with frontend
    const mapped = customers.map(c => ({
      ...c,
      billAddress: c.address,
      panNo: c.panNumber
    }));
    res.json(mapped);
  } catch (error) {
    console.error('Fetch Customers Error:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// POST new customer
router.post('/', requireSupabaseAuth, async (req, res) => {
  try {
    const { name, email, phone, company, billAddress, gstNumber, panNumber, notes } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        company,
        address: billAddress,
        gstNumber,
        panNumber,
        notes
      }
    });

    res.status(201).json({
      ...customer,
      billAddress: customer.address,
      panNo: customer.panNumber
    });
  } catch (error) {
    console.error('Create Customer Error:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// PUT update customer
router.put('/:id', requireSupabaseAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, company, billAddress, gstNumber, panNumber, notes } = req.body;

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        company,
        address: billAddress,
        gstNumber,
        panNumber,
        notes
      }
    });

    res.json({
      ...customer,
      billAddress: customer.address,
      panNo: customer.panNumber
    });
  } catch (error) {
    console.error('Update Customer Error:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// DELETE customer
router.delete('/:id', requireSupabaseAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.customer.delete({
      where: { id }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete Customer Error:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

module.exports = router;
