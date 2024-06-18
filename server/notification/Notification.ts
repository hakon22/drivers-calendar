/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable class-methods-use-this */
/* eslint-disable consistent-return */
/* eslint-disable camelcase */
import { Op, or } from 'sequelize';
import { Request, Response } from 'express';
import dayjs, { type Dayjs } from 'dayjs';
import isOverdueDate from '@/utilities/isOverdueDate.js';
import Notifications, { NotificationsModel } from '../db/tables/Notifications.js';
import Users, { PassportRequest } from '../db/tables/Users.js';
import type NotificationType from '../types/notification/NotificationType.js';
import NotificationEnum from '../types/notification/enum/NotificationEnum.js';
import Crews from '../db/tables/Crews.js';

class Notification {
  public async create(notification: NotificationType) {
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

  async acceptNotification(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { dataValues: { crewId } } = req.user as PassportRequest;

      const notification = await Notifications.findByPk(id);
      if (!notification) {
        return res.json({ code: 2 });
      }

      const crew = await Crews.findByPk(crewId, { include: { model: Users, as: 'users' } });
      if (!crew) {
        throw new Error('Экипаж не существует');
      }

      const notificationType = notification.type;

      if (notificationType === NotificationEnum.SHIFT) {
        const { data } = notification as { data: { firstShift: Dayjs, secondShift: Dayjs } };
        data.firstShift = dayjs(data.firstShift);
        data.secondShift = dayjs(data.secondShift);
        const { firstShift, secondShift } = data;

        const firstUser = crew.schedule_schema[firstShift.format('DD-MM-YYYY')];
        const secondUser = crew.schedule_schema[secondShift.format('DD-MM-YYYY')];
        crew.schedule_schema[firstShift.format('DD-MM-YYYY')] = secondUser;
        crew.schedule_schema[secondShift.format('DD-MM-YYYY')] = firstUser;

        const notifications: NotificationType[] = [];

        crew.users?.forEach(async (user) => {
          const preparedNotification = {
            userId: user.id,
            title: `${firstUser.username} поменялся сменами с ${secondUser.username}`,
            description: `${firstUser.username} выйдет ${secondShift?.locale('ru').format('D MMMM, dddd')}`,
            description2: `${secondUser.username} выйдет ${firstShift?.locale('ru').format('D MMMM, dddd')}`,
            type: NotificationEnum.SHIFT,
          };

          const newNotification = await Notification.prototype.create(preparedNotification);
          notifications.push(newNotification as NotificationType);
        });

        await Crews.update({ schedule_schema: crew.schedule_schema }, { where: { id: crewId } });
        return res.json({
          code: 1,
          notifications,
          firstShift: {
            [firstShift.format('DD-MM-YYYY')]: crew.schedule_schema[firstShift.format('DD-MM-YYYY')],
          },
          secondShift: {
            [secondShift.format('DD-MM-YYYY')]: crew.schedule_schema[secondShift.format('DD-MM-YYYY')],
          },
        });
      }
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
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
