import express from 'express';
import {
	getChats,
	startChat,
	getMessages,
	sendMessage,
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getChats);
router.post('/', protect, startChat);
router.get('/:chatId', protect, getMessages);
router.post('/:chatId/messages', protect, sendMessage);

export default router;
