import {
  DataTypes, Model, InferAttributes, InferCreationAttributes,
} from 'sequelize';
import ReservedDaysTypeEnum from '../../types/user/enum/ReservedDaysTypeEnum.js';
import { db } from '../connect.js';

export interface ReservedDaysModel extends Model<InferAttributes<ReservedDaysModel>, InferCreationAttributes<ReservedDaysModel>> {
  userId: number;
  reserved_days: string[];
  type: ReservedDaysTypeEnum;
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
    type: {
      type: DataTypes.ENUM(...Object.keys(ReservedDaysTypeEnum).filter((v) => Number.isNaN(Number(v)))),
      allowNull: false,
    },
  },
  { timestamps: false },
);

export default ReservedDays;
