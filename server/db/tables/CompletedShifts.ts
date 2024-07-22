import {
  DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional,
} from 'sequelize';
import { db } from '../connect.js';

export interface CompletedShiftsModel extends Model<InferAttributes<CompletedShiftsModel>, InferCreationAttributes<CompletedShiftsModel>> {
  id: CreationOptional<number>;
  date: Date;
  mileage: number;
  mileageAfterMaintenance: number;
  remainingFuel: number;
  refueling?: number;
  carId: number;
  crewId: number;
  userId: number;
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
