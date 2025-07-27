import sequelize from '../config/database';
import '../models'; // Import models to register them

const migrate = async () => {
  try {
    console.log('Starting database migration...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Create all tables
    await sequelize.sync({ force: false, alter: true });
    console.log('Database migration completed successfully.');
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();