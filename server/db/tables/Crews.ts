import {
  DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional,
} from 'sequelize';
import CrewScheduleEnum from '../../types/crew/enum/CrewScheduleEnum.js';
import type { ScheduleSchemaType } from '../../types/crew/ScheduleSchemaType.js';
import { db } from '../connect.js';
import type { UserModel } from './Users.js';
import type { CarModel } from './Cars.js';
import { ReservedDaysModel } from './ReservedDays.js';

export interface CrewModel extends Model<InferAttributes<CrewModel>, InferCreationAttributes<CrewModel>> {
  id: CreationOptional<number>;
  schedule: string;
  shiftOrder: number[];
  activeCar: CreationOptional<number>;
  schedule_schema: CreationOptional<ScheduleSchemaType>;
  users?: CreationOptional<UserModel[]>;
  cars?: CreationOptional<CarModel[]>;
  reservedDays?: CreationOptional<ReservedDaysModel[]>;
}

const Crews = db.define<CrewModel>(
  'crews',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    schedule: {
      type: DataTypes.ENUM(...Object.keys(CrewScheduleEnum).filter((v) => Number.isNaN(Number(v)))),
      allowNull: false,
    },
    shiftOrder: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      defaultValue: '{}',
    },
    activeCar: {
      type: DataTypes.INTEGER,
    },
    schedule_schema: {
      type: DataTypes.JSONB,
    },
  },
);

export default Crews;
