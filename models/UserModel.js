import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: false },
		email: { type: String, unique: true, required: true },
		otp: { type: Number },
		password: { type: String, required: false }, // Optional for social login
		googleId: { type: String, unique: true, sparse: true },
		facebookId: { type: String, unique: true, sparse: true },
		lastSeen: { type: Date, default: Date.now },
		isVerified: { type: Boolean, default: false },
		profileImage: { type: String },
		images: [{ type: String }], // Array of image URLs
		phone: { type: String, required: false },
		dateOfBirth: { type: Date, required: false },
		gender: {
			type: String,
			enum: ['Male', 'Female', 'Other'],
			required: false,
		},
		location: {
			type: {
				lat: { type: Number },
				lng: { type: Number },
			},
			required: false,
		},
		interests: [{ type: String }],
		idealMatches: [{ type: String }],
		profileVerified: { type: Boolean, default: false },
		likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Profiles liked by the user
		likesReceived: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Profiles that liked the user
		reports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Report' }],
	},
	{ timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;
