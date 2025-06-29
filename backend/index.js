// backend/index.js

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  registerCollegeUser,
  sendGuestOtp,
  verifyGuestOtp,
} from './controllers/registerController.js';

import CollegeUser from './models/CollegeUser.js';
import GuestUser from './models/GuestUser.js';
import mongoosePkg from 'mongoose'; // For ObjectId check
const { Types } = mongoosePkg;

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Multer config for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Serve uploaded images statically
app.use('/uploads', express.static(uploadsDir));

// Connect to MongoDB
mongoose
  .connect('mongodb://127.0.0.1:27017/lostandfound')
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection failed:', err));

// Item schema
const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['electronics', 'clothing', 'accessories', 'documents', 'keys', 'other'],
    required: true,
  },
  status: { type: String, enum: ['lost', 'found'], required: true },
  location: {
    lat: Number,
    lng: Number,
    description: String,
  },
  date: { type: Date, default: Date.now },
  reportedBy: { type: String, default: 'Anonymous User' },
  contactInfo: { type: String, required: true },
  imageUrl: String,
  isResolved: { type: Boolean, default: false },
});

const Item = mongoose.model('Item', itemSchema);

// Root
app.get('/', (req, res) => {
  res.send('Welcome to Lost & Found API');
});

// GET all items
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find().sort({ date: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching items', error: err });
  }
});

// ✅ NEW: GET item by ID
app.get('/api/items/:id', async (req, res) => {
  const { id } = req.params;

  if (!Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid item ID format' });
  }

  try {
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (err) {
    console.error('Error fetching item by ID:', err);
    res.status(500).json({ message: 'Failed to retrieve item', error: err });
  }
});

// POST new item with image upload
app.post('/api/items', upload.single('image'), async (req, res) => {
  try {
    const location = req.body.location ? JSON.parse(req.body.location) : {};

    const newItem = new Item({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      status: req.body.status,
      location,
      reportedBy: req.body.reportedBy || 'Anonymous User',
      contactInfo: req.body.contactInfo,
      imageUrl: req.file?.filename || '',
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.error('Error saving item:', err);
    res.status(400).json({ message: 'Failed to save item', error: err });
  }
});

// Registration and OTP
app.post('/api/register/college', registerCollegeUser);
app.post('/api/register/guest/send-otp', sendGuestOtp);
app.post('/api/register/guest/verify-otp', verifyGuestOtp);

// Identity verification
app.post('/api/verify/college', async (req, res) => {
  const { srNo, password } = req.body;
  try {
    const user = await CollegeUser.findOne({ srNo });
    if (!user) return res.status(404).json({ success: false, message: 'College user not found' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid password' });

    res.json({ success: true, message: 'College user verified' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Verification error', error: err });
  }
});

app.post('/api/verify/guest', async (req, res) => {
  const { mobile } = req.body;
  try {
    const guest = await GuestUser.findOne({ mobile });
    if (!guest) return res.status(404).json({ success: false, message: 'Guest user not found' });

    res.json({ success: true, message: 'Guest user verified' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Verification error', error: err });
  }
});

// Admin endpoints
app.get('/api/admin/users/college', async (req, res) => {
  try {
    const users = await CollegeUser.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch college users', error: err });
  }
});

app.get('/api/admin/users/guest', async (req, res) => {
  try {
    const guests = await GuestUser.find();
    res.json(guests);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch guest users', error: err });
  }
});

app.get('/api/admin/items/lost', async (req, res) => {
  try {
    const lostItems = await Item.find({ status: 'lost' }).sort({ date: -1 });
    res.json(lostItems);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch lost items', error: err });
  }
});

app.get('/api/admin/items/found', async (req, res) => {
  try {
    const foundItems = await Item.find({ status: 'found' }).sort({ date: -1 });
    res.json(foundItems);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch found items', error: err });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
