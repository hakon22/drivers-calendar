/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable class-methods-use-this */
/* eslint-disable consistent-return */
/* eslint-disable camelcase */
import { Op, or } from 'sequelize';
import { Request, Response } from 'express';
import isOverdueDate from '@/utilities/isOverdueDate.js';
import Notifications, { NotificationsModel } from '../db/tables/Notifications.js';
import { PassportRequest } from '../db/tables/Users.js';
import type NotificationType from '../types/notification/NotificationType.js';
import NotificationEnum from '../types/notification/enum/NotificationEnum.js';

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
      const { dataValues: { id, crewId } } = req.user as PassportRequest;
      const condition: any = { where: { userId: or(id, null) } };
      if (crewId) {
        condition.where = { [Op.and]: [{ userId: or(id, null) }, { crewId: or(crewId, null) }] };
      }
      const fetchedNotifications = await Notifications.findAll(condition) || [];
      const notifications: NotificationsModel[] = [];

      fetchedNotifications.forEach(async (fetchedNotifiction) => {
        if (fetchedNotifiction.type === NotificationEnum.INVITE && isOverdueDate(fetchedNotifiction.createdAt as Date, 1)) {
          await Notifications.destroy({ where: { id: fetchedNotifiction.id } });
        } else {
          notifications.push(fetchedNotifiction);
        }
      });

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
