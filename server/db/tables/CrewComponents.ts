import {
  DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional,
} from 'sequelize';
import { db } from '../connect.js';
import Cars from './Cars.js';
import Users from './Users.js';
import Crews from './Crews.js';

export interface CrewComponents extends Model<InferAttributes<CrewComponents>, InferCreationAttributes<CrewComponents>> {
  id: CreationOptional<number>;
}

const CrewComponents = db.define<CrewComponents>(
  'crew_components',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
  },
  { timestamps: false },
);

export default CrewComponents;

