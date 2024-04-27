import {
  DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional,
} from 'sequelize';
import { CrewScheduleEnum } from '../../types/crew/enum/CrewScheduleEnum.js';
import { db } from '../connect.js';
import CrewComponents from './CrewComponents.js';
import Users from './Users.js';
import Cars from './Cars.js';

export interface CrewModel extends Model<InferAttributes<CrewModel>, InferCreationAttributes<CrewModel>> {
  id: CreationOptional<number>;
  schedule: string;
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

Users.belongsTo(Crews);
Crews.belongsToMany(Users, { through: CrewComponents, as: 'users' });
Crews.belongsToMany(Cars, { through: CrewComponents, as: 'cars' });

export default Crews;