import NotificationEnum from './enum/NotificationEnum';

type NotificationType = {
  title: string;
  description: string;
  description2: string;
  type: NotificationEnum;
  userId?: number;
};

export default NotificationType;
