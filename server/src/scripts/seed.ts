import sequelize from '../config/database';
import { User, Vehicle, Expense } from '../models';

const seed = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Create admin user
    const adminUser = await User.findOrCreate({
      where: { email: 'admin@carlaville.com' },
      defaults: {
        email: 'admin@carlaville.com',
        password: 'admin123456',
        firstName: 'Admin',
        lastName: 'User',
        jobTitle: 'admin',
        phone: '+1234567890'
      }
    });

    // Create commercial user
    const commercialUser = await User.findOrCreate({
      where: { email: 'commercial@carlaville.com' },
      defaults: {
        email: 'commercial@carlaville.com',
        password: 'commercial123',
        firstName: 'Commercial',
        lastName: 'Manager',
        jobTitle: 'commercial',
        phone: '+1234567891'
      }
    });

    // Create agent users
    const agent1 = await User.findOrCreate({
      where: { email: 'agent1@carlaville.com' },
      defaults: {
        email: 'agent1@carlaville.com',
        password: 'agent123456',
        firstName: 'John',
        lastName: 'Smith',
        jobTitle: 'agent',
        phone: '+1234567892'
      }
    });

    const agent2 = await User.findOrCreate({
      where: { email: 'agent2@carlaville.com' },
      defaults: {
        email: 'agent2@carlaville.com',
        password: 'agent123456',
        firstName: 'Jane',
        lastName: 'Doe',
        jobTitle: 'agent',
        phone: '+1234567893'
      }
    });

    console.log('Users created successfully.');

    // Create sample vehicles
    const vehicle1 = await Vehicle.findOrCreate({
      where: { licensePlate: 'ABC-123' },
      defaults: {
        make: 'Toyota',
        model: 'Camry',
        year: 2022,
        licensePlate: 'ABC-123',
        vin: '1HGBH41JXMN109186',
        fuelType: 'gasoline',
        transmission: 'automatic',
        mileage: 15000,
        status: 'in_use',
        assignedUserId: agent1[0].id,
        purchaseDate: new Date('2022-01-15'),
        purchasePrice: 25000
      }
    });

    const vehicle2 = await Vehicle.findOrCreate({
      where: { licensePlate: 'XYZ-789' },
      defaults: {
        make: 'Honda',
        model: 'Civic',
        year: 2023,
        licensePlate: 'XYZ-789',
        vin: '2HGBH41JXMN109187',
        fuelType: 'gasoline',
        transmission: 'manual',
        mileage: 8000,
        status: 'available',
        purchaseDate: new Date('2023-03-10'),
        purchasePrice: 22000
      }
    });

    const vehicle3 = await Vehicle.findOrCreate({
      where: { licensePlate: 'DEF-456' },
      defaults: {
        make: 'Tesla',
        model: 'Model 3',
        year: 2023,
        licensePlate: 'DEF-456',
        vin: '3HGBH41JXMN109188',
        fuelType: 'electric',
        transmission: 'automatic',
        mileage: 5000,
        status: 'in_use',
        assignedUserId: agent2[0].id,
        purchaseDate: new Date('2023-06-20'),
        purchasePrice: 45000
      }
    });

    console.log('Vehicles created successfully.');

    // Create sample expenses
    const expenses = [
      {
        amount: 50.00,
        description: 'Fuel for company vehicle',
        date: new Date('2024-01-15'),
        category: 'fuel' as const,
        userId: agent1[0].id,
        vehicleId: vehicle1[0].id,
        isApproved: true,
        approvedBy: commercialUser[0].id,
        approvedAt: new Date('2024-01-16')
      },
      {
        amount: 25.50,
        description: 'Parking fees during client visit',
        date: new Date('2024-01-14'),
        category: 'parking' as const,
        userId: agent1[0].id,
        vehicleId: vehicle1[0].id,
        isApproved: false
      },
      {
        amount: 120.00,
        description: 'Vehicle maintenance check',
        date: new Date('2024-01-13'),
        category: 'maintenance' as const,
        userId: agent2[0].id,
        vehicleId: vehicle3[0].id,
        isApproved: true,
        approvedBy: adminUser[0].id,
        approvedAt: new Date('2024-01-14')
      },
      {
        amount: 85.50,
        description: 'Brake pad replacement',
        date: new Date('2024-01-12'),
        category: 'repairs' as const,
        userId: agent2[0].id,
        vehicleId: vehicle3[0].id,
        isApproved: false
      },
      {
        amount: 300.00,
        description: 'Monthly insurance payment',
        date: new Date('2024-01-01'),
        category: 'insurance' as const,
        userId: commercialUser[0].id,
        isApproved: true,
        approvedBy: adminUser[0].id,
        approvedAt: new Date('2024-01-02')
      }
    ];

    for (const expenseData of expenses) {
      await Expense.findOrCreate({
        where: {
          description: expenseData.description,
          userId: expenseData.userId,
          date: expenseData.date
        },
        defaults: expenseData
      });
    }

    console.log('Sample expenses created successfully.');
    console.log('Database seeding completed successfully.');
    
    console.log('\n=== SAMPLE LOGIN CREDENTIALS ===');
    console.log('Admin User:');
    console.log('  Email: admin@carlaville.com');
    console.log('  Password: admin123456');
    console.log('\nCommercial Manager:');
    console.log('  Email: commercial@carlaville.com');
    console.log('  Password: commercial123');
    console.log('\nAgent 1:');
    console.log('  Email: agent1@carlaville.com');
    console.log('  Password: agent123456');
    console.log('\nAgent 2:');
    console.log('  Email: agent2@carlaville.com');
    console.log('  Password: agent123456');
    console.log('================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();