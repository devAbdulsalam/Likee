import Notification from '../models/NotificationModel.js';
import User from '../models/UserModel.js';

// Send a notification
export const sendNotification = async (req, res) => {
	const { recipientId, message, type } = req.body;

	try {
		const user = await User.findById(recipientId);

		if (!user) {
			return res.status(404).json({ message: 'Recipient not found' });
		}

		const notification = await Notification.create({
			recipient: recipientId,
			message,
			type,
			read: false,
		});

		res
			.status(201)
			.json({ message: 'Notification sent successfully', notification });
	} catch (error) {
		res
			.status(500)
			.json({ message: 'Failed to send notification', error: error.message });
	}
};

// Get notifications for a user
export const getNotifications = async (req, res) => {
	const { userId } = req.params;

	try {
		const notifications = await Notification.find({ recipient: userId }).sort({
			createdAt: -1,
		});

		res.status(200).json(notifications);
	} catch (error) {
		res
			.status(500)
			.json({
				message: 'Failed to retrieve notifications',
				error: error.message,
			});
	}
};

// Mark notification as read
export const markAsRead = async (req, res) => {
	const { notificationId } = req.body;

	try {
		const notification = await Notification.findById(notificationId);

		if (!notification) {
			return res.status(404).json({ message: 'Notification not found' });
		}

		notification.read = true;
		await notification.save();

		res
			.status(200)
			.json({ message: 'Notification marked as read', notification });
	} catch (error) {
		res
			.status(500)
			.json({
				message: 'Failed to mark notification as read',
				error: error.message,
			});
	}
};
