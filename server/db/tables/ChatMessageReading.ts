/* import {
  DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional,
} from 'sequelize';
import { db } from '../connect.js';
import ChatMessages, { ChatMessagesModel } from './ChatMessages.js';
import Users from './Users.js';

export interface ChatMessageReadingModel extends Model<InferAttributes<ChatMessageReadingModel>, InferCreationAttributes<ChatMessageReadingModel>> {
  messageId: CreationOptional<number>;
  userId: CreationOptional<number>,
  messages?: CreationOptional<ChatMessagesModel[]>,
}

const ChatMessageReading = db.define<ChatMessageReadingModel>(
  'chat_message_reading',
  {
    messageId: {
      type: DataTypes.INTEGER,
      references: {
        model: ChatMessages,
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: Users,
        key: 'id',
      },
    },
  },
  { timestamps: false },
);

export default ChatMessageReading;
*/
