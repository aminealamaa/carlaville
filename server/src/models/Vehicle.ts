import { Model, DataTypes, CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import sequelize from '../config/database';

export interface VehicleAttributes {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  transmission: 'automatic' | 'manual';
  mileage: number;
  status: 'available' | 'in_use' | 'maintenance' | 'retired';
  assignedUserId?: string;
  purchaseDate?: Date;
  purchasePrice?: number;
  insuranceExpiry?: Date;
  registrationExpiry?: Date;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

class Vehicle extends Model<InferAttributes<Vehicle>, InferCreationAttributes<Vehicle>> {
  declare id: CreationOptional<string>;
  declare make: string;
  declare model: string;
  declare year: number;
  declare licensePlate: string;
  declare vin: string;
  declare fuelType: CreationOptional<'gasoline' | 'diesel' | 'electric' | 'hybrid'>;
  declare transmission: CreationOptional<'automatic' | 'manual'>;
  declare mileage: CreationOptional<number>;
  declare status: CreationOptional<'available' | 'in_use' | 'maintenance' | 'retired'>;
  declare assignedUserId: CreationOptional<string>;
  declare purchaseDate: CreationOptional<Date>;
  declare purchasePrice: CreationOptional<number>;
  declare insuranceExpiry: CreationOptional<Date>;
  declare registrationExpiry: CreationOptional<Date>;
  declare lastMaintenanceDate: CreationOptional<Date>;
  declare nextMaintenanceDate: CreationOptional<Date>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Vehicle.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  make: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 50],
    },
  },
  model: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 50],
    },
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1900,
      max: new Date().getFullYear() + 1,
    },
  },
  licensePlate: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [1, 20],
    },
  },
  vin: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [17, 17],
    },
  },
  fuelType: {
    type: DataTypes.ENUM('gasoline', 'diesel', 'electric', 'hybrid'),
    defaultValue: 'gasoline',
  },
  transmission: {
    type: DataTypes.ENUM('automatic', 'manual'),
    defaultValue: 'automatic',
  },
  mileage: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  status: {
    type: DataTypes.ENUM('available', 'in_use', 'maintenance', 'retired'),
    defaultValue: 'available',
  },
  assignedUserId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  purchaseDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  purchasePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0,
    },
  },
  insuranceExpiry: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  registrationExpiry: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  lastMaintenanceDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  nextMaintenanceDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'Vehicle',
  tableName: 'vehicles',
});

export default Vehicle;