import NotificationEnum from './enum/NotificationEnum';

type NotificationType = {
  title: string;
  description: string;
  description2?: string;
  type: NotificationEnum;
  authorId?: number;
  crewId?: number;
  userId?: number;
  isDecision?: boolean;
};

export default NotificationType;
