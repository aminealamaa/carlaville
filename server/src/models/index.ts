import User from './User';
import Vehicle from './Vehicle';
import Expense from './Expense';

// Define associations
User.hasMany(Vehicle, { foreignKey: 'assignedUserId', as: 'assignedVehicles' });
Vehicle.belongsTo(User, { foreignKey: 'assignedUserId', as: 'assignedUser' });

User.hasMany(Expense, { foreignKey: 'userId', as: 'expenses' });
Expense.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Vehicle.hasMany(Expense, { foreignKey: 'vehicleId', as: 'expenses' });
Expense.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });

// Approval relationship for expenses
User.hasMany(Expense, { foreignKey: 'approvedBy', as: 'approvedExpenses' });
Expense.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

export {
  User,
  Vehicle,
  Expense,
};