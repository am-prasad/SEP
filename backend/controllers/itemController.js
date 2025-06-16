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
    const items = await Item.find().sort({ date: -1 });
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ message: 'Failed to retrieve items', error });
  }
};
