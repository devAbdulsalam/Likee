import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL,
		pass: process.env.PASSWORD,
	},
});

export const sendMail = async (to, subject, text) => {
	const mailOptions = {
		from: from || process.env.SENDERMAIL || 'ammuftau74@gmil.com',
		to,
		subject,
		text,
	};

	return transporter.sendMail(mailOptions);
};
