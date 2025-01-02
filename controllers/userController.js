import cloudinary from '../config/cloudinary.js';
import User from '../models/UserModel.js';

export const getUserProfile = async (req, res) => {
	const user = await User.findById(req.user._id).select('-password');
	if (user) {
		res.json(user);
	} else {
		res.status(404).json({ message: 'User not found' });
	}
};

export const updateUserProfile = async (req, res) => {
	const user = await User.findById(req.user._id);
	if (!user) {
		return res.status(404).json({ message: 'User not found' });
	}

	Object.assign(user, req.body); // Update fields
	await user.save();
	res.json(user);
};

/**
 * Update Profile Picture
 * @route PUT /api/users/profile-picture
 * @access Private
 */
export const updateProfilePicture = async (req, res) => {
	const { file } = req.files; // Assuming you are using a file upload middleware
	const userId = req.user.id; // Populated by auth middleware

	if (!file) {
		return res.status(400).json({ message: 'File is required' });
	}

	try {
		// Upload image to Cloudinary
		const result = await cloudinary.uploader.upload(file.path, {
			folder: 'profile_pictures',
			public_id: `user_${userId}`,
			overwrite: true,
		});

		// Update user profile picture in the database
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		user.profileImage = result.secure_url;
		await user.save();

		res.status(200).json({
			message: 'Profile picture updated successfully',
			profileImage: result.secure_url,
		});
	} catch (error) {
		res.status(500).json({
			message: 'Failed to update profile picture',
			error: error.message,
		});
	}
};

export const verifyProfile = async (req, res) => {
	const user = await User.findById(req.params.id);
	if (!user) {
		return res.status(404).json({ message: 'User not found' });
	}

	user.profileVerified = true;
	await user.save();
	res.json({ message: 'Profile verified' });
};

export const searchUsers = async (req, res) => {
	const { interests, location, nearMe } = req.query;

	let filter = {};
	if (interests) filter.interests = { $in: interests.split(',') };
	if (location) filter.location = location;
	if (nearMe) {
		// Add "near me" filter logic here
	}

	const users = await User.find(filter);
	res.json(users);
};

export const likeUser = async (req, res) => {
	const user = await User.findById(req.params.id);
	const targetUser = await User.findById(req.params.targetId);

	if (!user || !targetUser)
		return res.status(404).json({ message: 'User not found' });

	if (!user.likes.includes(targetUser.id)) {
		user.likes.push(targetUser.id);
		targetUser.likesReceived.push(user.id);
		await user.save();
		await targetUser.save();
	}

	res.json({ message: 'User liked' });
};

export const getLikes = async (req, res) => {
	const user = await User.findById(req.params.id).populate('likes');
	res.json(user.likes);
};

export const getLikesReceived = async (req, res) => {
	const user = await User.findById(req.params.id).populate('likesReceived');
	res.json(user.likesReceived);
};
