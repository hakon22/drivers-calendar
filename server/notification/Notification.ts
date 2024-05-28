/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable class-methods-use-this */
/* eslint-disable consistent-return */
/* eslint-disable camelcase */
import { or } from 'sequelize';
import { Request, Response } from 'express';
import Notifications from '../db/tables/Notifications.js';
import { PassportRequest } from '../db/tables/Users.js';
import type NotificationType from '../types/notification/NotificationType.js';

class Notification {
  public async send(notification: NotificationType) {
    try {
      if (!notification.title || !notification.type) {
        throw new Error('[Notification.Error]: Не указан один или более параметров');
      }
      const result = await Notifications.create(notification);
      console.log(`[Notification]: создано уведомление для пользователя с userId: ${notification?.userId}`);
      return result;
    } catch (e) {
      console.log(e);
    }
  }

  async fetchNotifications(req: Request, res: Response) {
    try {
      const { dataValues: { id } } = req.user as PassportRequest;
      const notifications = await Notifications.findAll({ where: { userId: or(id, null) } }) || [];

      return res.json({ code: 1, notifications });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async readUpdate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await Notifications.update({ isRead: true }, { where: { id } });

      return res.json({ code: 1, id });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await Notifications.destroy({ where: { id } });

      return res.json({ code: 1, id });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }
}

export default new Notification();
