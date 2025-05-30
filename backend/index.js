import express, { json } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

// Import registration controller functions
import {
  registerCollegeUser,
  sendGuestOtp,
  verifyGuestOtp,
} from './controllers/registerController.js';

// Import CollegeUser and GuestUser models
import CollegeUser from './models/CollegeUser.js';
import GuestUser from './models/GuestUser.js';

// Create Express app
const app = express();
app.use(json());
app.use(cors());

// Connect to MongoDB (use your desired database name)
mongoose.connect('mongodb://127.0.0.1:27017/lostandfound')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection failed', err));

// Define Item schema and model
const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['electronics', 'clothing', 'accessories', 'documents', 'keys', 'other'],
    required: true
  },
  status: { type: String, enum: ['lost', 'found'], required: true },
  location: {
    lat: Number,
    lng: Number,
    description: String
  },
  date: { type: Date, default: Date.now },
  reportedBy: { type: String, default: 'Anonymous User' },
  contactInfo: { type: String, required: true },
  imageUrl: String,
  isResolved: { type: Boolean, default: false }
});

const Item = mongoose.model('Item', itemSchema);

// Routes

app.get('/', (req, res) => {
  res.send('Welcome to Lost & Found API');
});

// Lost & Found item routes

// Get all items
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find().sort({ date: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching items', error: err });
  }
});

// Post a new item report
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

// Registration routes

app.post('/api/register/college', registerCollegeUser);
app.post('/api/register/guest/send-otp', sendGuestOtp);
app.post('/api/register/guest/verify-otp', verifyGuestOtp);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
