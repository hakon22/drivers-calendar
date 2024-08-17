/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
/* eslint-disable import/no-cycle */
/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable class-methods-use-this */
import { Request, Response } from 'express';
import { Context } from 'telegraf';
import { Message } from 'typegram/message';
import Users from '../db/tables/Users';
import { telegramBotService } from '../server';

class Telegram {
  public webhooks = async (req: Request, res: Response) => {
    try {
      const context = req.body as Context;
      const message = context.message as Message.TextMessage;

      if (message?.text === '/start') {
        const replyMarkup = {
          keyboard: [
            [
              {
                text: 'Отправить номер телефона',
                request_contact: true,
              },
            ],
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
        };
        await telegramBotService.sendMessage('Пожалуйста, предоставьте ваш номер телефона:', message?.from?.id?.toString() as string, { reply_markup: replyMarkup });
      } else if (message?.reply_to_message) {
        const user = await Users.findOne({ where: { phone: message?.text } });
        if (user) {
          await Users.update({ telegramId: message?.from?.id?.toString() }, { where: { phone: message?.text } });
          await telegramBotService.sendMessage('Вы успешно подписались на обновления.', message?.from?.id?.toString() as string);
        } else {
          await telegramBotService.sendMessage('Номер телефона не найден в базе данных.', message?.from?.id?.toString() as string);
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
