/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable class-methods-use-this */
/* eslint-disable consistent-return */
/* eslint-disable camelcase */
import { or } from 'sequelize';
import { Request, Response } from 'express';
import UserNotifications from '../db/tables/UserNotifications.js';
import { PassportRequest } from '../db/tables/Users.js';
import UserNotificationEnum from '../types/user/enum/UserNotificationEnum';

class Notification {
  public async send(userId: number, message: string, type: UserNotificationEnum) {
    try {
      if (!message || !type) {
        throw new Error('[Notification.Error]: Не указан один или более параметров');
      }
      await UserNotifications.create({ message, type, userId });
      console.log(`[Notification]: создано уведомление для пользователя с userId: ${userId}`);
    } catch (e) {
      console.log(e);
    }
  }

  async fetchNotifications(req: Request, res: Response) {
    try {
      const { dataValues: { id } } = req.user as PassportRequest;
      const notifications = await UserNotifications.findAll({ where: { userId: or(id, null) } }) || [];

      return res.json({ code: 1, notifications });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }
}

export default new Notification();
