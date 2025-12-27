import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const sendWhatsapp = async (target: string, message: string) => {
  try {
    if (!process.env.FONNTE_TOKEN) return;

    await axios.post(
      'https://api.fonnte.com/send',
      {
        target: target,
        message: message,
      },
      {
        headers: {
          Authorization: process.env.FONNTE_TOKEN,
        },
      }
    );
  } catch (error) {
    console.error('Fonnte Error', error);
  }
};