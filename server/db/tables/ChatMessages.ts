import {
  DataTypes, Model, InferAttributes, InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { db } from '../connect.js';
import { UserModel } from './Users.js';

export interface ChatMessagesModel extends Model<InferAttributes<ChatMessagesModel>, InferCreationAttributes<ChatMessagesModel>> {
  id: CreationOptional<number>;
  message: string;
  authorId: number;
  crewId: number;
  createdAt?: CreationOptional<Date>;
  author?: CreationOptional<UserModel>;
  readBy: CreationOptional<number[]>;
}

const ChatMessages = db.define<ChatMessagesModel>(
  'chat_messages',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    authorId: {
      type: DataTypes.INTEGER,
    },
    crewId: {
      type: DataTypes.INTEGER,
    },
    readBy: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      defaultValue: [],
    },
  },
);

export default ChatMessages;
