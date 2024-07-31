import {
  DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional,
} from 'sequelize';
import bcrypt from 'bcryptjs';
import { db } from '../connect.js';

export interface UserModel extends Model<InferAttributes<UserModel>, InferCreationAttributes<UserModel>> {
  id: CreationOptional<number>;
  username: string;
  password: string;
  phone: string;
  role: string;
  color: string;
  refresh_token: CreationOptional<string[]>;
  crewId: CreationOptional<number | null>;
  isRoundCalendarDays: CreationOptional<boolean>;
}

export interface PassportRequest {
  dataValues: UserModel;
  token: string;
  refreshToken: string;
}

const Users = db.define<UserModel>(
  'users',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: 'phone',
    },
    role: {
      type: DataTypes.ENUM('admin', 'member'),
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    refresh_token: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: [],
    },
    crewId: {
      type: DataTypes.INTEGER,
    },
    isRoundCalendarDays: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    hooks: {
      beforeCreate: (user) => {
        user.password = bcrypt.hashSync(user.password, 10);
      },
    },
  },
);

export default Users;
