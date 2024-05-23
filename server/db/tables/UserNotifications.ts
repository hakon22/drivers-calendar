import {
  DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional,
} from 'sequelize';
import UserNotificationEnum from '../../types/user/enum/UserNotificationEnum.js';
import { db } from '../connect.js';
import Users from './Users.js';

export interface UserNotificationsModel extends Model<InferAttributes<UserNotificationsModel>, InferCreationAttributes<UserNotificationsModel>> {
  id: CreationOptional<number>;
  message: string;
  type: UserNotificationEnum;
  isRead: CreationOptional<boolean>;
  userId: CreationOptional<number>;
}

const UserNotifications = db.define<UserNotificationsModel>(
  'user_notifications',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
    },
    type: {
      type: DataTypes.ENUM(...Object.keys(UserNotificationEnum).filter((v) => Number.isNaN(Number(v)))),
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      defaultValue: null,
    },
  },
);

Users.hasMany(UserNotifications, { as: 'notifications' });

export default UserNotifications;
