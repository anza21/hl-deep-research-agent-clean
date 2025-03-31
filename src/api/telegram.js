import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

export const sendMessage = async (message, no_webpage = true) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const text = encodeURIComponent(message);
  const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${text}&disable_web_page_preview=${no_webpage}&parse_mode=HTML`;
  await fetch(url);
};
