import {
  DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional,
} from 'sequelize';
import { db } from '../connect.js';
import { CrewModel } from './Crews.js';

export interface CarModel extends Model<InferAttributes<CarModel>, InferCreationAttributes<CarModel>> {
  id: CreationOptional<number>;
  brand: string;
  model: string;
  inventory: string;
  call: string;
  mileage: number;
  mileage_after_maintenance: number;
  remaining_fuel: number;
  fuel_consumption_summer_city: number;
  fuel_consumption_winter_city: number;
  fuel_consumption_summer_highway: number;
  fuel_consumption_winter_highway: number;
  createdAt?: CreationOptional<Date>;
  updatedAt?: CreationOptional<Date>;
  crews?: CreationOptional<CrewModel[]>;
}

const Cars = db.define<CarModel>(
  'cars',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    inventory: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: 'inventory',
    },
    call: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: 'call',
    },
    mileage: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    mileage_after_maintenance: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    remaining_fuel: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    fuel_consumption_summer_city: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    fuel_consumption_winter_city: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    fuel_consumption_summer_highway: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    fuel_consumption_winter_highway: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
  },
);

export default Cars;
