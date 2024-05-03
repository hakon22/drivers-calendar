import {
  DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional,
} from 'sequelize';
import { CrewScheduleEnum } from '../../types/crew/enum/CrewScheduleEnum.js';
import { db } from '../connect.js';
import CrewComponents from './CrewComponents.js';
import Users, { UserModel } from './Users.js';
import Cars, { CarModel } from './Cars.js';

export interface CrewModel extends Model<InferAttributes<CrewModel>, InferCreationAttributes<CrewModel>> {
  id: CreationOptional<number>;
  schedule: string;
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
      type: DataTypes.ENUM(...Object.keys(CrewScheduleEnum).filter((v) => isNaN(Number(v)))),
      allowNull: false,
    },
  },
);

Crews.hasMany(Users, { as: 'users' });
Crews.hasMany(Cars, { as: 'cars' });

export default Crews;