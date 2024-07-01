import {
  DataTypes, Model, InferAttributes, InferCreationAttributes,
} from 'sequelize';
import { db } from '../connect.js';

export interface ReservedDaysModel extends Model<InferAttributes<ReservedDaysModel>, InferCreationAttributes<ReservedDaysModel>> {
  userId: number;
  reserved_days: string[];
}

const ReservedDays = db.define<ReservedDaysModel>(
  'reserved_days',
  {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    reserved_days: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
    },
  },
  { timestamps: false },
);

export default ReservedDays;
