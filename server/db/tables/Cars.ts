import {
  DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional,
} from 'sequelize';
import { db } from '../connect.js';

interface CarsModel
  extends Model<InferAttributes<CarsModel>, InferCreationAttributes<CarsModel>> {
  id?: CreationOptional<number>;
  brand: string;
  model: string;
  inventory: number;
  call: number;
  mileage: number;
  mileage_before_maintenance: number;
  remaining_fuel: number;
  fuel_consumption_summer: number;
  fuel_consumption_winter: number;
}

const Cars = db.define<CarsModel>(
  'Cars',
  {
    brand: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    inventory: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    call: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    mileage: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    mileage_before_maintenance: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    remaining_fuel: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fuel_consumption_summer: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fuel_consumption_winter: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
);

export default Cars;
