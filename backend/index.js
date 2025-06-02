import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

// Import controller functions
import {
  registerCollegeUser,
  sendGuestOtp,
  verifyGuestOtp,
} from './controllers/registerController.js';

// Import Mongoose models
import CollegeUser from './models/CollegeUser.js';
import GuestUser from './models/GuestUser.js';

// Initialize Express app
const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/lostandfound')
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection failed:', err));

// Define Item schema & model (if not using external file)
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

// --- ROUTES ---

// Root check
app.get('/', (req, res) => {
  res.send('Welcome to Lost & Found API');
});

// 📦 Items
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find().sort({ date: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching items', error: err });
  }
});

app.post('/api/items', async (req, res) => {
  try {
    const newItem = new Item(req.body);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.error('Error saving item:', err);
    res.status(400).json({ message: 'Failed to save item', error: err });
  }
});

// 🧑‍🎓 Registration + OTP
app.post('/api/register/college', registerCollegeUser);
app.post('/api/register/guest/send-otp', sendGuestOtp);
app.post('/api/register/guest/verify-otp', verifyGuestOtp);

// 🔐 Admin Endpoints

// Get all college users
app.get('/api/admin/users/college', async (req, res) => {
  try {
    const users = await CollegeUser.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch college users', error: err });
  }
});

// Get all guest users
app.get('/api/admin/users/guest', async (req, res) => {
  try {
    const guests = await GuestUser.find();
    res.json(guests);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch guest users', error: err });
  }
});

// Get all lost items
app.get('/api/admin/items/lost', async (req, res) => {
  try {
    const lostItems = await Item.find({ status: 'lost' }).sort({ date: -1 });
    res.json(lostItems);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch lost items', error: err });
  }
});

// Get all found items
app.get('/api/admin/items/found', async (req, res) => {
  try {
    const foundItems = await Item.find({ status: 'found' }).sort({ date: -1 });
    res.json(foundItems);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch found items', error: err });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
