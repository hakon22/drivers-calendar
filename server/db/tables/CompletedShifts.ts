import {
  DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional,
} from 'sequelize';
import { db } from '../connect.js';
import { UserModel } from './Users.js';
import { CarModel } from './Cars.js';

export interface CompletedShiftsModel extends Model<InferAttributes<CompletedShiftsModel>, InferCreationAttributes<CompletedShiftsModel>> {
  id: CreationOptional<number>;
  date: CreationOptional<Date>;
  mileage: number;
  mileageAfterMaintenance: number;
  remainingFuel: number;
  refueling?: number;
  carId: number;
  crewId: number;
  userId: number;
  user?: UserModel;
  car?: CarModel;
}

const CompletedShifts = db.define<CompletedShiftsModel>(
  'completed_shifts',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    mileage: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    mileageAfterMaintenance: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    remainingFuel: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    refueling: {
      type: DataTypes.DECIMAL,
    },
    carId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    crewId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  { timestamps: false },
);

export default CompletedShifts;
