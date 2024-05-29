import NotificationEnum from './enum/NotificationEnum';

type NotificationType = {
  title: string;
  description: string;
  description2: string;
  type: NotificationEnum;
  authorId: number;
  crewId?: number;
  userId?: number;
  createAt?: Date;
};

export default NotificationType;
