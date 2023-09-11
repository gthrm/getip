import express from 'express';
import rateLimit from 'express-rate-limit';
import {sendIp} from './utils/kafka.utils.js';
import {logger} from './utils/logger.utils.js';

const app = express();
const port = process.env.PORT || 3344;

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per windowMs
	message: {
		error: {
			code: 429,
			message: 'Too many requests from your IP. Please wait 15 Minutes',
		},
	},
});

app.use(express.json());
app.use(limiter);

app.get('/ip', async (req, res) => {
	try {
		const ip = req.headers['x-real-ip'] || req.socket.remoteAddress;
		logger.info(ip, req.headers);
		res.send(ip);
		sendIp(ip, process.env.SERVICE_NAME);
	} catch (error) {
		logger.error(error);
		res.status(502);
		res.send('It\'s f*cking error');
	}
});

app.listen(port, () => {
	console.log(`App listening at http://localhost:${port}`);
});
