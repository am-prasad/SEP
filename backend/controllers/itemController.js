// controllers/itemController.js
import Item from '../models/Item.js';

export const addItem = async (req, res) => {
  try {
    const item = new Item(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(400).json({ message: 'Failed to add item', error });
  }
};

export const getItems = async (req, res) => {
  try {
    const { status, category, q } = req.query;

    const filters = {};

    if (status && status !== 'all') {
      filters.status = status;
    }

    if (category && category !== 'all') {
      filters.category = category;
    }

    if (q) {
      const regex = new RegExp(q, 'i'); // case-insensitive regex
      filters.$or = [
        { title: regex },
        { description: regex }
      ];
    }

    const items = await Item.find(filters).sort({ date: -1 });
    res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ message: 'Failed to retrieve items', error });
  }
};
