const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const settingsPath = path.join(__dirname, '..', 'data', 'settings.json');

// Ensure data dir exists
if (!fs.existsSync(path.dirname(settingsPath))) {
  fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
}

// Default settings if file doesn't exist
const DEFAULT_SETTINGS = {
  companyName: "Shapio 3D Technologies",
  companyAddress: "No. 216, Indira Nagar, Ammanapakkam,\nChengalpattu – 603003, Tamil Nadu, India",
  gstin: "33QLBPS8301A1ZC",
  pan: "QLBPS8301A",
  email: "shapio3dtech@gmail.com",
  phone: "",
  accountName: "SHAPIO 3D TECHNOLOGIES",
  accountNumber: "0457073000000458",
  ifsc: "SIBL0000457",
  branch: "SOUTH INDIAN BANK, CHENGALPATTU BRANCH - KANCHIPURAM"
};

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

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET all settings
router.get('/', requireSupabaseAuth, async (req, res) => {
  try {
    const settingsData = await prisma.setting.findMany();
    let settings = { ...DEFAULT_SETTINGS };
    settingsData.forEach(s => settings[s.key] = s.value);
    res.json(settings);
  } catch (error) {
    console.error('Fetch Settings Error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// POST update settings
router.post('/', requireSupabaseAuth, async (req, res) => {
  try {
    const newSettings = req.body;
    
    // Convert object to array of { key, value }
    const updates = Object.entries(newSettings).map(([key, value]) => ({ key, value: String(value) }));
    
    // We will loop and upsert each key
    for (const item of updates) {
      await prisma.setting.upsert({
        where: { key: item.key },
        update: { value: item.value },
        create: { key: item.key, value: item.value }
      });
    }

    res.json({ success: true, settings: newSettings });
  } catch (error) {
    console.error('Update Settings Error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router;
