import {
  DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional,
} from 'sequelize';
import CrewScheduleEnum from '../../types/crew/enum/CrewScheduleEnum.js';
import type { ScheduleSchemaType } from '../../types/crew/ScheduleSchemaType.js';
import { db } from '../connect.js';
import type { UserModel } from './Users.js';
import type { CarModel } from './Cars.js';

export interface CrewModel extends Model<InferAttributes<CrewModel>, InferCreationAttributes<CrewModel>> {
  id: CreationOptional<number>;
  schedule: string;
  activeCar: CreationOptional<number>,
  schedule_schema: CreationOptional<ScheduleSchemaType>,
  users?: CreationOptional<UserModel[]>,
  cars?: CreationOptional<CarModel[]>,
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
    schedule_schema: {
      type: DataTypes.JSONB,
    },
    activeCar: {
      type: DataTypes.INTEGER,
    },
  },
);

export default Crews;
