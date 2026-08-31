const express = require('express')
const router = express.Router()
const { z } = require('zod')
const { processAndUploadFile } = require('../middleware/upload')
const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() }) // Temporarily handle multipart for form parsing
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Zod schema for strict input validation
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  phone: z.string().max(20).optional().nullable(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000).trim(),
})

// POST /api/contact
// Handles contact form submission, file validation/upload, and DB insert
router.post('/', upload.single('file'), processAndUploadFile, async (req, res, next) => {
  try {
    // 1. Strict Input Validation via Zod
    const validatedData = contactSchema.parse({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      message: req.body.message,
    })

    // 2. Generate Tracking ID
    const trackingId = `KRX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // 3. Format message if file was attached
    const finalMessage = req.file?.fileUrl 
      ? `${validatedData.message}\n\n[ATTACHMENT]: ${req.file.fileUrl}` 
      : validatedData.message
    
    // 4. Insert into Supabase via Prisma
    await prisma.contactMessage.create({
      data: {
        trackingId,
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        message: finalMessage,
        fileUrl: req.file?.fileUrl || null,
        status: 'new'
      }
    })
    
    res.status(200).json({ 
      success: true, 
      trackingId,
      message: 'Contact request received successfully' 
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      })
    }
    console.error('Contact submission error:', error)
    next(error)
  }
})

// GET /api/contact/track/:trackingId
// Retrieves the status of a specific contact submission
router.get('/track/:trackingId', async (req, res, next) => {
  try {
    const { trackingId } = req.params;
    const message = await prisma.contactMessage.findUnique({
      where: { trackingId }
    });

    if (!message) {
      return res.status(404).json({ error: 'Tracking ID not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        trackingId: message.trackingId,
        status: message.status,
        createdAt: message.createdAt,
        name: message.name,
        email: message.email,
        message: message.message
      }
    });
  } catch (error) {
    console.error('Tracking lookup error:', error);
    next(error);
  }
})

module.exports = router
