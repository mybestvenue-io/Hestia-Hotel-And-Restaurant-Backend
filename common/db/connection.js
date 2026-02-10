(function () {
	const mongoose = require('mongoose');

	async function connect() {
		const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hestia';
		try {
			await mongoose.connect(uri, {
				// useNewUrlParser: true,
				// useUnifiedTopology: true,
			});
			console.log('MongoDB connected');
		} catch (err) {
			console.error('MongoDB connection error:', err);
			process.exit(1);
		}
	}

	module.exports = { connect, mongoose };
})();

