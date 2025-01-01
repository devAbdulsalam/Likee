import express from 'express';
import dotenv from 'dotenv';
import passport from './config/passport.js'; // Import the passport configuration
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import bodyParser from 'body-parser';
import cors from 'cors';
import connectDB from './config/db.js';
import User from './models/UserModel.js';

import { protect } from './middleware/authMiddleware.js';
import colors from 'colors';

// Load environment variables
dotenv.config();
const app = express();

app.use(bodyParser.json());
app.use(express.static('public')); // configure static file to save images locally
// app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors('*'));

// Connect to MongoDB
connectDB();

app.use(passport.initialize());
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: '*', // Replace with your frontend URL for security
		methods: ['GET', 'POST'],
	},
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/report', reportRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/', (req, res) => {
	res.send('Welcome to the API');
});

const onlineUsers = new Map();

io.on('connection', (socket) => {
	console.log('A user connected:', socket.id);

	// User online
	socket.on('user-online', ({ userId }) => {
		onlineUsers.set(userId, socket.id);
		io.emit('update-online-status', { userId, status: 'online' });
	});

	// User typing
	socket.on('user-typing', ({ chatId, userId }) => {
		socket.to(chatId).emit('typing', { userId });
	});

	// Stop typing
	socket.on('stop-typing', ({ chatId, userId }) => {
		socket.to(chatId).emit('stop-typing', { userId });
	});

	// User disconnect
	socket.on('disconnect', async () => {
		for (const [userId, socketId] of onlineUsers.entries()) {
			if (socketId === socket.id) {
				onlineUsers.delete(userId);

				// Update last seen in the database
				await User.findByIdAndUpdate(userId, { lastSeen: new Date() });

				io.emit('update-online-status', { userId, status: 'offline' });
			}
		}
	});
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
	console.log(
		`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
	);
});
