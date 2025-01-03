import mongoose from 'mongoose';
const notificationSchema = new mongoose.Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	type: {
		type: String,
		enum: ['PROFILE_VIEWED', 'LIKED', 'MESSAGE_RECEIVED'],
		required: true,
	},
	from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
	message: { type: String, required: false },
	read: { type: Boolean, default: false },
	createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
