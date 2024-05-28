import {
  DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional,
} from 'sequelize';
import NotificationEnum from '../../types/notification/enum/NotificationEnum.js';
import { db } from '../connect.js';

export interface NotificationsModel extends Model<InferAttributes<NotificationsModel>, InferCreationAttributes<NotificationsModel>> {
  id: CreationOptional<number>;
  title: string;
  description: string;
  description2: string;
  type: NotificationEnum;
  isRead: CreationOptional<boolean>;
  userId: CreationOptional<number>;
}

const Notifications = db.define<NotificationsModel>(
  'notifications',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.TEXT,
    },
    description: {
      type: DataTypes.TEXT,
    },
    description2: {
      type: DataTypes.TEXT,
    },
    type: {
      type: DataTypes.ENUM(...Object.keys(NotificationEnum).filter((v) => Number.isNaN(Number(v)))),
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    userId: {
      type: DataTypes.INTEGER,
    },
  },
);

export default Notifications;
