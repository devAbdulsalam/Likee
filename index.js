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

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/report', reportRoutes);
app.use('/api/v1/notifications', notificationRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
	console.log(
		`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
	);
});
