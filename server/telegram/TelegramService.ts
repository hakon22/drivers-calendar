/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable class-methods-use-this */
import { Telegraf, Markup } from 'telegraf';

class Telegram {
  public telegramBot: Telegraf;

  constructor(telegramBot: Telegraf) {
    this.telegramBot = telegramBot;
    this.telegramBot.telegram.setWebhook(`${process.env.NEXT_PUBLIC_PRODUCTION_HOST}/api/telegram`);
  }

  public sendMessage = async (message: string, telegramId: string, options?: typeof Markup) => {
    try {
      const msg = encodeURI(message);
      await this.telegramBot.telegram.sendMessage(msg, telegramId, { parse_mode: 'HTML', ...options });
      console.log('Сообщение в Telegram отправлено!');
    } catch (e) {
      console.log('Ошибка отправки сообщения в Telegram :(', e);
    }
  };

  public sendMessageAfterEndWorkShift = async (username: string, mileage: number, remainingFuel: number, telegramId: string) => {
    try {
      const fields = [
        `<b>${username}</b> закрыл смену!`,
        `Пробег: <b>${mileage}</b>`,
        `Остаток топлива: <b>${remainingFuel}</b>`,
      ];
      const msg = encodeURI(fields.reduce((acc, field) => acc += `${field}\n`, ''));
      await this.telegramBot.telegram.sendMessage(msg, telegramId, { parse_mode: 'HTML' });
    } catch (e) {
      console.log('Ошибка отправки сообщения в Telegram :(', e);
    }
  };
}

export default Telegram;
