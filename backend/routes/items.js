import express from 'express';
import { addItem, getItems } from '../controllers/itemController.js';

const router = express.Router();

router.post('/', addItem);
router.get('/', getItems);

export default router;
