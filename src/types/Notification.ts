import UserNotificationEnum from '../../server/types/user/enum/UserNotificationEnum';
import { InitialState } from './InitialState';

export type Notification = {
  id: number;
  message: string;
  type: UserNotificationEnum;
  isRead: boolean;
};

export type NotificationInitialState = InitialState;
