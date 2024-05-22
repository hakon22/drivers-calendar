/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable class-methods-use-this */
/* eslint-disable consistent-return */
/* eslint-disable camelcase */
import UserNotifications from '../db/tables/UserNotifications.js';
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
}

export default new Notification();
