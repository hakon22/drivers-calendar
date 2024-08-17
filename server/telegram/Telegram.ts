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
        console.log(message);
        const text = 'Напишите ваш номер телефона в ответ (свайпните влево) на это сообщение.';
        await telegramBotService.sendMessage(text, message?.from?.id as number);
      } else if (message?.reply_to_message) {
        const user = await Users.findOne({ where: { phone: message?.text } });
        if (user) {
          await Users.update({ telegramId: message?.from?.id }, { where: { phone: message?.text } });
          await telegramBotService.sendMessage('Теперь вы будете получать уведомления.', message?.from?.id as number);
        } else {
          await telegramBotService.sendMessage('Номер телефона не найден в базе данных.', message?.from?.id as number);
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
