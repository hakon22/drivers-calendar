import NotificationEnum from '../../server/types/notification/enum/NotificationEnum';
import { InitialState } from './InitialState';

export type Notification = {
  id: number;
  title: string;
  description: string;
  description2: string;
  type: NotificationEnum;
  userId: number;
  authorId: number;
  crewId: number;
  isRead: boolean;
  isDecision: boolean;
};

export type NotificationInitialState = InitialState;
