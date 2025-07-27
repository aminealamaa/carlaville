import { Model, DataTypes, CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import sequelize from '../config/database';

export interface ExpenseAttributes {
  id: string;
  amount: number;
  description: string;
  date: Date;
  category: 'fuel' | 'maintenance' | 'repairs' | 'travel' | 'insurance' | 'parking' | 'other';
  userId: string;
  vehicleId?: string;
  receiptUrl?: string;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

class Expense extends Model<InferAttributes<Expense>, InferCreationAttributes<Expense>> {
  declare id: CreationOptional<string>;
  declare amount: number;
  declare description: string;
  declare date: Date;
  declare category: 'fuel' | 'maintenance' | 'repairs' | 'travel' | 'insurance' | 'parking' | 'other';
  declare userId: string;
  declare vehicleId: CreationOptional<string>;
  declare receiptUrl: CreationOptional<string>;
  declare isApproved: CreationOptional<boolean>;
  declare approvedBy: CreationOptional<string>;
  declare approvedAt: CreationOptional<Date>;
  declare rejectionReason: CreationOptional<string>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Expense.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [1, 500],
    },
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM('fuel', 'maintenance', 'repairs', 'travel', 'insurance', 'parking', 'other'),
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  vehicleId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'vehicles',
      key: 'id',
    },
  },
  receiptUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  approvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  rejectionReason: {
    type: DataTypes.TEXT,
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
  modelName: 'Expense',
  tableName: 'expenses',
});

export default Expense;