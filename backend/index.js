import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';

import {
  registerCollegeUser,
  sendGuestOtp,
  verifyGuestOtp,
} from './controllers/registerController.js';

import CollegeUser from './models/CollegeUser.js';
import GuestUser from './models/GuestUser.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

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

// GET items
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find().sort({ date: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching items', error: err });
  }
});

// ✅ POST item with image upload and correct parsing
app.post('/api/items', upload.single('image'), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      status,
      contactInfo,
      reportedBy,
      date,
      'location[lat]': lat,
      'location[lng]': lng,
      'location[description]': locationDescription,
      isResolved,
    } = req.body;

    const newItem = new Item({
      title,
      description,
      category,
      status,
      contactInfo,
      reportedBy: reportedBy || 'Anonymous User',
      isResolved: isResolved === 'true',
      date: date ? new Date(date) : new Date(),
      location: {
        lat: lat ? parseFloat(lat) : undefined,
        lng: lng ? parseFloat(lng) : undefined,
        description: locationDescription || '',
      },
      imageUrl: req.file
        ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
        : '',
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.error('❌ Error saving item:', err);
    res.status(400).json({ message: 'Failed to save item', error: err.message });
  }
});

// Registration and OTP routes
app.post('/api/register/college', registerCollegeUser);
app.post('/api/register/guest/send-otp', sendGuestOtp);
app.post('/api/register/guest/verify-otp', verifyGuestOtp);

// Identity verification routes
app.post('/api/verify/college', async (req, res) => {
  const { srNo, password } = req.body;
  try {
    const user = await CollegeUser.findOne({ srNo });
    if (!user) {
      return res.status(404).json({ success: false, message: 'College user not found' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    res.json({ success: true, message: 'College user verified' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Verification error', error: err });
  }
});

app.post('/api/verify/guest', async (req, res) => {
  const { mobile } = req.body;
  try {
    const guest = await GuestUser.findOne({ mobile });
    if (!guest) {
      return res.status(404).json({ success: false, message: 'Guest user not found' });
    }

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
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
