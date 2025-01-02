import mongoose from 'mongoose';

const OtpSchema = new mongoose.Schema(
	{
		Otp: { type: String, unique: true, required: true },
		otp: { type: Number },
	},

	{ timestamps: true }
);

const Otp = mongoose.model('Otp', OtpSchema);
export default Otp;
