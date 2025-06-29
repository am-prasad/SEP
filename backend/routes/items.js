// backend/routes/items.js

import express from 'express';
import {
  addItem,
  getItems,
  getItemById
} from '../controllers/itemController.js';

const router = express.Router();

// POST /api/items - Add a new item
router.post('/', addItem);

// GET /api/items - Get all items
router.get('/', getItems);

// GET /api/items/:id - Get a specific item by ID
router.get('/:id', getItemById);

export default router;
