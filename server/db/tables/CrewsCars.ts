import {
  DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional,
} from 'sequelize';
import { db } from '../connect.js';
import Crews, { CrewModel } from './Crews.js';
import Cars, { CarModel } from './Cars.js';

export interface CrewCarModel extends Model<InferAttributes<CrewCarModel>, InferCreationAttributes<CrewCarModel>> {
  crewId: CreationOptional<number>;
  carId: CreationOptional<number>,
  crews?: CreationOptional<CrewModel[]>,
  cars?: CreationOptional<CarModel[]>,
}

const CrewsCars = db.define<CrewCarModel>(
  'crews_cars',
  {
    crewId: {
      type: DataTypes.INTEGER,
      references: {
        model: Crews,
        key: 'id',
      },
    },
    carId: {
      type: DataTypes.INTEGER,
      references: {
        model: Cars,
        key: 'id',
      },
    },
  },
  { timestamps: false },
);

export default CrewsCars;
