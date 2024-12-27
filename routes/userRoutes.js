import express from 'express';
import {
	getUserProfile,
	updateUserProfile,
	verifyProfile,
	searchUsers,
	likeUser,
	getLikes,
	getLikesReceived,
	updateProfilePicture,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js'; // File upload middleware

const router = express.Router();
router.get('/:id', protect, getUserProfile);
router.put('/:id', protect, updateUserProfile);
router.put(
	'/profile-picture',
	protect,
	upload.single('profilePicture'),
	updateProfilePicture
);
router.post('/:id/verify', protect, verifyProfile);
router.get('/search', protect, searchUsers);
router.post('/:id/like/:targetId', protect, likeUser);
router.get('/:id/likes', protect, getLikes);
router.get('/:id/likesReceived', protect, getLikesReceived);

export default router;
