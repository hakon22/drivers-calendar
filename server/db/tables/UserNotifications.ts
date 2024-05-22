import {
  DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional,
} from 'sequelize';
import UserNotificationEnum from '../../types/user/enum/UserNotificationEnum.js';
import { db } from '../connect.js';
import Users, { UserModel } from './Users.js';

export interface UserNotificationsModel extends Model<InferAttributes<UserNotificationsModel>, InferCreationAttributes<UserNotificationsModel>> {
  id: CreationOptional<number>;
  message: string;
  type: UserNotificationEnum;
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
    userId: {
      type: DataTypes.INTEGER,
    },
  },
);

Users.hasMany(UserNotifications, { as: 'notifications' });

export default UserNotifications;
