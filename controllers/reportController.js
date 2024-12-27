import Report from '../models/ReportModel.js';
import User from '../models/UserModel.js';

// Report a user
export const reportUser = async (req, res) => {
	const { reportedBy, reportedUser, reason } = req.body;

	if (reportedBy === reportedUser) {
		return res.status(400).json({ message: "You can't report yourself" });
	}

	try {
		const userExists = await User.findById(reportedUser);

		if (!userExists) {
			return res.status(404).json({ message: 'Reported user not found' });
		}

		const report = await Report.create({ reportedBy, reportedUser, reason });

		res.status(201).json({ message: 'User reported successfully', report });
	} catch (error) {
		res
			.status(500)
			.json({ message: 'Failed to report user', error: error.message });
	}
};

// Get all reports
export const getReports = async (req, res) => {
	try {
		const reports = await Report.find()
			.populate('reportedBy', 'name email')
			.populate('reportedUser', 'name email');
		res.status(200).json(reports);
	} catch (error) {
		res
			.status(500)
			.json({ message: 'Failed to retrieve reports', error: error.message });
	}
};

// Handle a report
export const handleReport = async (req, res) => {
	const { reportId, action } = req.body;

	try {
		const report = await Report.findById(reportId);

		if (!report) {
			return res.status(404).json({ message: 'Report not found' });
		}

		report.status = action;
		await report.save();

		res.status(200).json({ message: 'Report handled successfully', report });
	} catch (error) {
		res
			.status(500)
			.json({ message: 'Failed to handle report', error: error.message });
	}
};
