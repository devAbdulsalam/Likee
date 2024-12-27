import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: process.env.SMTP_PORT,
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},
});

export const sendMail = async (to, subject, text) => {
	const mailOptions = {
		from: '"Your App Name" <no-reply@yourapp.com>',
		to,
		subject,
		text,
	};

	return transporter.sendMail(mailOptions);
};
