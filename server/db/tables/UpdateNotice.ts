import {
  DataTypes, Model, InferAttributes, InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import { db } from '../connect.js';

export interface UpdateNoticeModel extends Model<InferAttributes<UpdateNoticeModel>, InferCreationAttributes<UpdateNoticeModel>> {
  id: CreationOptional<number>;
  title: string;
  message: string;
  createdAt?: CreationOptional<Date>;
  readBy: CreationOptional<number[]>;
}

const UpdateNotice = db.define<UpdateNoticeModel>(
  'update_notice',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    readBy: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      defaultValue: [],
    },
  },
);

export default UpdateNotice;
