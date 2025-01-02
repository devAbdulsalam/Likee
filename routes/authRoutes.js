import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import {
	register,
	login,
	refreshToken,
	verifyEmail,
	forgotPassword,
	resetPassword,
	updatePassword,
	newUserOtp,
	verifyEmailOtp,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/send-reg-otp', newUserOtp);
router.post('/verify-reg-otp', verifyEmailOtp);
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/update-password', protect, updatePassword);

// Google login route
router.get(
	'/google',
	passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google callback
router.get(
	'/google/callback',
	passport.authenticate('google', { session: false }),
	(req, res) => {
		const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, {
			expiresIn: '30d',
		});
		res.redirect(`http://localhost:3000/dashboard?token=${token}`); // Redirect to frontend
	}
);

// Facebook login route
// router.get(
// 	'/facebook',
// 	passport.authenticate('facebook', { scope: ['email'] })
// );

// Facebook callback
// router.get(
// 	'/facebook/callback',
// 	passport.authenticate('facebook', { session: false }),
// 	(req, res) => {
// 		const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, {
// 			expiresIn: '30d',
// 		});
// 		res.redirect(`http://localhost:3000/dashboard?token=${token}`); // Redirect to frontend
// 	}
// );

export default router;
