/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable class-methods-use-this */
import axios from 'axios';
import { Telegraf } from 'telegraf';

class Telegram {
  private telegramBot: Telegraf;

  constructor(telegramBot: Telegraf) {
    this.telegramBot = telegramBot;
    this.telegramBot.telegram.setWebhook(`${process.env.NEXT_PUBLIC_PRODUCTION_HOST}/api/telegram`);
  }

  public sendMessage = async (message: string, telegramId: number) => {
    const msg = encodeURI(message);
    const { data } = await axios.get<{ ok: boolean }>(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage?chat_id=${telegramId}&parse_mode=html&text=${msg}`);
    if (data.ok) {
      console.log('Сообщение в Telegram отправлено!');
    } else {
      console.log('Ошибка отправки сообщения в Telegram :(');
    }
  };

  public sendMessageAfterEndWorkShift = async (username: string, mileage: number, remainingFuel: number, telegramId: number) => {
    const fields = [
      `<b>${username}</b> закрыл смену!`,
      `Пробег: <b>${mileage}</b>`,
      `Остаток топлива: <b>${remainingFuel}</b>`,
    ];
    const msg = encodeURI(fields.reduce((acc, field) => acc += `${field}\n`, ''));
    const { data } = await axios.get<{ ok: boolean }>(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage?chat_id=${telegramId}&parse_mode=html&text=${msg}`);
    if (data.ok) {
      console.log('Сообщение в Telegram отправлено!');
    } else {
      console.log('Ошибка отправки сообщения в Telegram :(');
    }
  };
}

export default Telegram;
