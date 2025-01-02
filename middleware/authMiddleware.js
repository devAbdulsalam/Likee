import jwt from 'jsonwebtoken';
import User from '../models/UserModel.js';

export const protect = async (req, res, next) => {
	const { authorization } = req.headers;
	const token =
		req.cookies?.accessToken ||
		authorization?.split(' ')[1] ||
		req.header('Authorization')?.replace('Bearer ', '');
	// const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

	if (!token) {
		return res.status(401).json({ message: 'Not authorized, no token' });
	}

	try {
		const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
		// console.log('decoded', decoded);

		req.user = await User.findById(decoded.id).select('-password'); // Attach user to request
		next();
	} catch (error) {
		res.status(401).json({ message: 'Not authorized, token failed' });
	}
};
