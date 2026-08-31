const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { requireSupabaseAuth } = require('../middleware/auth');
const multer = require('multer');
const { processAndUploadFile } = require('../middleware/upload');
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/products
// Get all products
router.get('/', requireSupabaseAuth, async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (error) {
    next(error);
  }
});

// POST /api/products
// Create a new product with optional GLB file upload
router.post('/', requireSupabaseAuth, upload.single('file'), processAndUploadFile, async (req, res, next) => {
  try {
    const payload = {
      name: req.body.name,
      description: req.body.description || null,
      material: req.body.material || null,
      price: Number(req.body.price) || 0,
      isActive: req.body.isActive === 'true' || req.body.isActive === true,
      modelUrl: req.file?.fileUrl || null
    };

    const newProduct = await prisma.product.create({
      data: payload
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    next(error);
  }
});

// PUT /api/products/:id
// Update a product
router.put('/:id', requireSupabaseAuth, upload.single('file'), processAndUploadFile, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const payload = {
      name: req.body.name,
      description: req.body.description || null,
      material: req.body.material || null,
      price: Number(req.body.price) || 0,
      isActive: req.body.isActive === 'true' || req.body.isActive === true,
    };

    if (req.file?.fileUrl) {
      payload.modelUrl = req.file.fileUrl;
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: payload
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    next(error);
  }
});

// DELETE /api/products/:id
router.delete('/:id', requireSupabaseAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({
      where: { id }
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
