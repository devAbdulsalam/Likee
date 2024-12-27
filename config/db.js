import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
	try {
		const conn = await mongoose.connect(process.env.MONGO_URI);
		console.log(
			`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold
		);
	} catch (error) {
		console.error(`Error: ${error.message}`.red.underline.bold);
		process.exit(1); // Exit process with failure
	}
};

export default connectDB;
