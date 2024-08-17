/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
/* eslint-disable import/no-cycle */
/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable class-methods-use-this */
import { Request, Response } from 'express';
import { Context as TelegrafContext } from 'telegraf';
import { Message } from 'typegram/message';
import Users from '../db/tables/Users';
import { telegramBotService } from '../server';

interface Context extends TelegrafContext {
  callbackQuery: TelegrafContext['callbackQuery'] & { data?: string },
}

class Telegram {
  public webhooks = async (req: Request, res: Response) => {
    try {
      const context = req.body as Context;
      const message = context.message as Message.ContactMessage & Message.TextMessage;

      const start = async () => {
        const replyMarkup = {
          keyboard: [
            [
              {
                text: 'Отправить номер телефона',
                request_contact: true,
              },
              {
                text: 'Рестарт',
                callback_data: 'start_button',
              },
            ],
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
        };
        await telegramBotService.sendMessage('Пожалуйста, предоставьте ваш номер телефона:', message?.from?.id?.toString() as string, { reply_markup: replyMarkup });
      };

      if (message?.text === '/start') {
        await start();
      } else if (message?.contact?.phone_number) {
        const user = await Users.findOne({ where: { phone: message.contact.phone_number } });
        if (user) {
          await Users.update({ telegramId: message?.from?.id?.toString() }, { where: { phone: message.contact.phone_number } });
          await telegramBotService.sendMessage('Вы успешно подписались на обновления.', message?.from?.id?.toString() as string);
        } else {
          await telegramBotService.sendMessage('Номер телефона не найден в базе данных.', message?.from?.id?.toString() as string);
        }
      } else if (context?.callbackQuery) {
        const callData = context.callbackQuery?.data;
        if (callData === 'start_button') {
          await start();
        }
      } else if (context.myChatMember?.new_chat_member?.status === 'kicked') {
        const telegramId = context.myChatMember.chat.id;
        console.log('TelegramBotService', `User has blocked a bot. Deleting telegramID: ${telegramId}`);

        await Users.update({ telegramId: null }, { where: { telegramId } });
      }
      res.end();
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  };
}

export default new Telegram();
