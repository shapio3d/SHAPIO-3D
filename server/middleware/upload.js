const multer = require('multer')
const { v4: uuidv4 } = require('uuid')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const path = require('path')

// Initialize S3 Client for Cloudflare R2 (or any S3 compatible storage)
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
})

// Use memory storage to buffer the file so we can validate magic bytes before saving
const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  // Initial check by extension
  const allowed = [
    '.glb', '.gltf', '.stl', '.obj', '.step',
    '.pdf', '.jpg', '.jpeg', '.png', '.webp'
  ]
  const ext = path.extname(file.originalname).toLowerCase()
  if (allowed.includes(ext)) {
    cb(null, true)
  } else {
    cb(new Error(`File type ${ext} not allowed`), false)
  }
}

// 20MB hard size cap
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 20 * 1024 * 1024,
  },
})

/**
 * Middleware to process the memory-buffered file, check magic bytes, and upload to R2
 */
const processAndUploadFile = async (req, res, next) => {
  if (!req.file) return next()

  try {
    // 1. Validate magic bytes (actual file signature)
    const fileType = await import('file-type')
    const type = await fileType.default.fromBuffer(req.file.buffer)
    
    const ext = path.extname(req.file.originalname).toLowerCase()
    const isPlainText3D = ['.obj', '.stl', '.step'].includes(ext)

    if (!type && !isPlainText3D) {
      return res.status(400).json({ error: 'Invalid file signature detected.' })
    }

    if (type) {
      // Basic cross-check: if they uploaded a .jpg but the signature is 'application/x-msdownload' (exe), block it
      const safeMimeTypes = [
        'model/gltf-binary', 'model/gltf+json', 
        'application/pdf', 'image/jpeg', 'image/png', 'image/webp'
      ]
      
      // If it's a known format, make sure it's in our safe list
      if (!safeMimeTypes.includes(type.mime) && !isPlainText3D) {
        return res.status(400).json({ error: `Malicious file signature detected: ${type.mime}` })
      }
    }

    // 2. Randomize filename to prevent path traversal / overwrites
    const newFilename = `${uuidv4()}${ext}`

    // 3. Upload to Cloudflare R2
    if (process.env.R2_BUCKET_NAME) {
      const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: `uploads/${newFilename}`,
        Body: req.file.buffer,
        ContentType: type ? type.mime : 'application/octet-stream',
      })
      await s3Client.send(command)
      
      // Attach the R2 public URL to the request so the route handler can save it to DB
      req.file.fileUrl = `${process.env.R2_PUBLIC_URL}/uploads/${newFilename}`
    } else {
      // Fallback for local development if R2 isn't configured yet
      const fs = require('fs')
      const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads')
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }
      const localPath = path.join(uploadDir, newFilename)
      fs.writeFileSync(localPath, req.file.buffer)
      req.file.fileUrl = `/uploads/${newFilename}`
    }

    // Free up memory
    req.file.buffer = null
    next()
  } catch (err) {
    console.error('File processing error:', err)
    return res.status(500).json({ error: 'File upload failed' })
  }
}

module.exports = { upload, processAndUploadFile }
