import User from '../models/UserModel.js';
import { sendMail } from '../config/mailer.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Generate Access Token
const generateAccessToken = (user) => {
	return jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
	});
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
	return jwt.sign({ _id: user._id }, process.env.REFRESH_TOKEN_SECRET, {
		expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
	});
};

// Generate 4-digit OTP
const generateOTP = () => Math.floor(1000 + Math.random() * 9000);

/**
 * Register User & Send OTP Email
 * @route POST /api/auth/register
 */
export const register = async (req, res) => {
	const { name, email, password } = req.body;

	try {
		const userExists = await User.findOne({ email });
		if (userExists) {
			return res.status(400).json({ message: 'User already exists' });
		}

		const otp = generateOTP();

		const user = await User.create({
			name,
			email,
			password: await bcrypt.hash(password, 10),
			otp,
		});

		// Remove password from the response
		user.password = undefined;

		await sendMail(email, 'Verify Your Email', `Your OTP is: ${otp}`);
		res
			.status(201)
			.json({ user, message: 'User registered. Check your email for OTP.' });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

/**
 * Verify Email with OTP
 * @route POST /api/auth/verify-email
 */
export const verifyEmail = async (req, res) => {
	const { email, otp } = req.body;

	try {
		const user = await User.findOne({ email, otp });
		if (!user) {
			return res.status(400).json({ message: 'Invalid OTP or email' });
		}

		user.isVerified = true;
		user.otp = null; // Clear OTP
		await user.save();

		res.status(200).json({ message: 'Email verified successfully' });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

/**
 * Forgot Password & Send OTP Email
 * @route POST /api/auth/forgot-password
 */
export const forgotPassword = async (req, res) => {
	const { email } = req.body;

	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		const otp = generateOTP();
		user.otp = otp;
		await user.save();

		await sendMail(email, 'Reset Your Password', `Your OTP is: ${otp}`);
		res.status(200).json({ message: 'OTP sent to email' });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

/**
 * Verify OTP & Change Password
 * @route POST /api/auth/reset-password
 */
export const resetPassword = async (req, res) => {
	const { email, otp, newPassword } = req.body;

	try {
		const user = await User.findOne({ email, otp });
		if (!user) {
			return res.status(400).json({ message: 'Invalid OTP or email' });
		}

		user.password = await bcrypt.hash(newPassword, 10);
		user.otp = null; // Clear OTP
		await user.save();

		res.status(200).json({ message: 'Password reset successfully' });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

/**
 * Update Password (Authenticated User)
 * @route PUT /api/auth/update-password
 */
export const updatePassword = async (req, res) => {
	const { oldPassword, newPassword } = req.body;
	const userId = req.user.id;

	try {
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		const isMatch = await bcrypt.compare(oldPassword, user.password);
		if (!isMatch) {
			return res.status(400).json({ message: 'Old password is incorrect' });
		}

		user.password = await bcrypt.hash(newPassword, 10);
		await user.save();

		res.status(200).json({ message: 'Password updated successfully' });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const login = async (req, res) => {
	const { email, password } = req.body;

	const user = await User.findOne({ email });
	if (user && (await bcrypt.compare(password, user.password))) {
		res.json({
			id: user.id,
			email: user.email,
			accessToken: generateAccessToken(user),
			refreshToken: generateRefreshToken(user),
		});
	} else {
		res.status(401).json({ message: 'Invalid credentials' });
	}
};

/**
 * Refresh Access Token
 * @route POST /api/auth/refresh-token
 * @access Public
 */
export const refreshToken = (req, res) => {
	const { refreshToken } = req.body;

	if (!refreshToken) {
		return res.status(400).json({ message: 'Refresh token required' });
	}

	jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
		if (err) {
			return res.status(403).json({ message: 'Invalid refresh token' });
		}

		const newAccessToken = generateAccessToken({ _id: user.id });
		res.status(200).json({ accessToken: newAccessToken });
	});
};
