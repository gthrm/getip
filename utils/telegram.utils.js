import {Writable} from 'stream';
import TelegramBot from 'node-telegram-bot-api';
import {config} from 'dotenv';
import {transports} from 'winston';

config();

const telegramToken = process.env.BOT_TOKEN;
const chatId = process.env.CHAT_ID;
const bot = new TelegramBot(telegramToken);

const writableStream = new Writable({
	write(message, encoding, callback) {
		const parsedMessage = JSON.parse(message.toString());
		if (parsedMessage.level === 'error') {
			bot.sendMessage(chatId, `[${parsedMessage.level}] ${parsedMessage.message}`);
		}

		callback();
	},
});

export const telegramTransport = new transports.Stream({
	stream: writableStream,
});
