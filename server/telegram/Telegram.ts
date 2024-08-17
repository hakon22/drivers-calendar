/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
/* eslint-disable import/no-cycle */
/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable class-methods-use-this */
import { Request, Response } from 'express';
import { Context, Markup } from 'telegraf';
import { message } from 'telegraf/filters';
import Users from '../db/tables/Users';
import { telegramBotService } from '../server';

class Telegram {
  public webhooks = async (req: Request, res: Response) => {
    try {
      const context = req.body as Context;

      telegramBotService.telegramBot.start((ctx) => {
        ctx.reply(
          'Пожалуйста, предоставьте ваш номер телефона:',
          Markup.keyboard([
            Markup.button.contactRequest('Отправить номер телефона'),
          ])
            .oneTime()
            .resize(),
        );
      });

      telegramBotService.telegramBot.on(message('contact'), (ctx) => {
        ctx.reply('Вы успешно подписались на уведомления.');
      });

      if (context.myChatMember?.new_chat_member?.status === 'kicked') {
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
