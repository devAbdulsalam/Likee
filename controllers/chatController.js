import Chat from '../models/ChatModel.js';
import User from '../models/UserModel.js';

/**
 * Get all chats for the logged-in user
 * @route GET /api/chats
 * @access Private
 */
export const getChats = async (req, res) => {
	try {
		const userId = req.user.id; // Assuming `req.user` is set by `protect` middleware
		const chats = await Chat.find({ participants: userId })
			.populate('participants', 'name email profileImage')
			.sort({ updatedAt: -1 });

		res.status(200).json(chats);
	} catch (error) {
		res
			.status(500)
			.json({ message: 'Failed to retrieve chats', error: error.message });
	}
};

/**
 * Start a new chat or retrieve an existing one
 * @route POST /api/chats
 * @access Private
 */
export const startChat = async (req, res) => {
	const { receiverId } = req.body;

	if (req.user.id === receiverId) {
		return res
			.status(400)
			.json({ message: "You can't start a chat with yourself" });
	}

	try {
		let chat = await Chat.findOne({
			participants: { $all: [req.user.id, receiverId] },
		});

		if (!chat) {
			chat = await Chat.create({
				participants: [req.user.id, receiverId],
				messages: [],
			});
		}

		res.status(201).json(chat);
	} catch (error) {
		res
			.status(500)
			.json({ message: 'Failed to start chat', error: error.message });
	}
};

/**
 * Get all messages for a specific chat
 * @route GET /api/chats/:chatId
 * @access Private
 */
export const getMessages = async (req, res) => {
	const { chatId } = req.params;

	try {
		const chat = await Chat.findById(chatId);

		if (!chat) {
			return res.status(404).json({ message: 'Chat not found' });
		}

		// Check if the user is a participant in the chat
		if (!chat.participants.includes(req.user.id)) {
			return res.status(403).json({ message: 'Access denied' });
		}

		res.status(200).json(chat.messages);
	} catch (error) {
		res
			.status(500)
			.json({ message: 'Failed to retrieve messages', error: error.message });
	}
};

/**
 * Send a message in a specific chat
 * @route POST /api/chats/:chatId/messages
 * @access Private
 */
export const sendMessage = async (req, res) => {
	const { chatId } = req.params;
	const { content } = req.body;

	try {
		const chat = await Chat.findById(chatId);

		if (!chat) {
			return res.status(404).json({ message: 'Chat not found' });
		}

		// Check if the user is a participant in the chat
		if (!chat.participants.includes(req.user.id)) {
			return res.status(403).json({ message: 'Access denied' });
		}

		const message = { sender: req.user.id, content, timestamp: new Date() };
		chat.messages.push(message);
		chat.updatedAt = new Date();
		await chat.save();

		res.status(200).json(message);
	} catch (error) {
		res
			.status(500)
			.json({ message: 'Failed to send message', error: error.message });
	}
};
