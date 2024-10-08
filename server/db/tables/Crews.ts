import {
  DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional,
} from 'sequelize';
import CrewScheduleEnum from '../../types/crew/enum/CrewScheduleEnum.js';
import type { ScheduleSchemaType } from '../../types/crew/ScheduleSchemaType.js';
import { db } from '../connect.js';
import type { UserModel } from './Users.js';
import type { CarModel } from './Cars.js';
import { ReservedDaysModel } from './ReservedDays.js';
import { ChatMessagesModel } from './ChatMessages.js';
import SeasonEnum from '../../types/crew/enum/SeasonEnum.js';

export interface CrewModel extends Model<InferAttributes<CrewModel>, InferCreationAttributes<CrewModel>> {
  id: CreationOptional<number>;
  schedule: string;
  name: string;
  shiftOrder: CreationOptional<number[]>;
  activeCar: CreationOptional<number>;
  season: CreationOptional<SeasonEnum>;
  isRoundFuelConsumption: CreationOptional<boolean>;
  isWorkingWeekend: CreationOptional<boolean>;
  schedule_schema: CreationOptional<ScheduleSchemaType>;
  ref: CreationOptional<string>;
  users?: CreationOptional<UserModel[]>;
  cars?: CreationOptional<CarModel[]>;
  chat?: CreationOptional<ChatMessagesModel[]>;
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shiftOrder: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      defaultValue: [],
    },
    activeCar: {
      type: DataTypes.INTEGER,
    },
    season: {
      type: DataTypes.ENUM(...Object.keys(SeasonEnum).filter((v) => Number.isNaN(Number(v)))),
      allowNull: false,
      defaultValue: SeasonEnum.SUMMER,
    },
    isRoundFuelConsumption: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isWorkingWeekend: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    schedule_schema: {
      type: DataTypes.JSONB,
    },
    ref: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
  },
);

export default Crews;
