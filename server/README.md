# Carlaville Management System - Backend

A robust Express.js backend API for the Carlaville Management System, featuring vehicle management, expense tracking, and user authentication.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Support for different user roles (admin, commercial, agent)
- **Vehicle Management**: Complete CRUD operations for fleet management
- **Expense Tracking**: Expense submission, approval workflow, and reporting
- **Database**: MySQL with Sequelize ORM
- **Security**: Rate limiting, CORS, helmet, input validation
- **File Uploads**: Support for receipt attachments
- **API Documentation**: RESTful API with comprehensive validation

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT tokens
- **Validation**: Joi schema validation
- **Security**: Helmet, CORS, Rate limiting
- **File Processing**: Multer for uploads
- **Language**: TypeScript

## Quick Start

### Prerequisites

- Node.js 18 or higher
- MySQL 5.7 or higher
- npm or yarn package manager

### Installation

1. **Clone and navigate to the server directory**:
   ```bash
   cd server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your database credentials and JWT secrets.

4. **Create MySQL database**:
   ```sql
   CREATE DATABASE carlaville_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

5. **Run database migrations**:
   ```bash
   npm run migrate
   ```

6. **Seed the database with sample data**:
   ```bash
   npm run seed
   ```

7. **Start the development server**:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000`

## Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=carlaville_db
DB_USER=root
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_token_secret_here
JWT_REFRESH_EXPIRES_IN=30d

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Vehicles
- `GET /api/vehicles` - Get all vehicles (paginated)
- `GET /api/vehicles/:id` - Get vehicle by ID
- `POST /api/vehicles` - Create new vehicle (admin/commercial only)
- `PUT /api/vehicles/:id` - Update vehicle (admin/commercial only)
- `DELETE /api/vehicles/:id` - Delete vehicle (admin only)
- `PATCH /api/vehicles/:id/assign` - Assign/unassign vehicle (admin/commercial only)

### Expenses
- `GET /api/expenses` - Get all expenses (paginated, filtered by user role)
- `GET /api/expenses/stats` - Get expense statistics
- `GET /api/expenses/:id` - Get expense by ID
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `PATCH /api/expenses/:id/approve` - Approve expense (admin/commercial only)
- `PATCH /api/expenses/:id/reject` - Reject expense (admin/commercial only)

## User Roles & Permissions

### Agent
- View their own expenses and vehicles
- Create, update, delete their own expenses (if not approved)
- View vehicle information

### Commercial
- All agent permissions
- Create, update vehicles
- Assign/unassign vehicles
- Approve/reject expenses
- View all expenses

### Admin
- All commercial permissions
- Delete vehicles
- Manage all users
- Full system access

## Sample Login Credentials

After running the seed script, you can use these credentials:

**Admin User:**
- Email: `admin@carlaville.com`
- Password: `admin123456`

**Commercial Manager:**
- Email: `commercial@carlaville.com`
- Password: `commercial123`

**Agent:**
- Email: `agent1@carlaville.com`
- Password: `agent123456`

## Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `password` (String, Hashed)
- `firstName` (String)
- `lastName` (String)
- `jobTitle` (Enum: agent, commercial, admin)
- `phone` (String, Optional)
- `isActive` (Boolean)
- `lastLogin` (DateTime)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Vehicles Table
- `id` (UUID, Primary Key)
- `make` (String)
- `model` (String)
- `year` (Integer)
- `licensePlate` (String, Unique)
- `vin` (String, Unique)
- `fuelType` (Enum: gasoline, diesel, electric, hybrid)
- `transmission` (Enum: automatic, manual)
- `mileage` (Integer)
- `status` (Enum: available, in_use, maintenance, retired)
- `assignedUserId` (UUID, Foreign Key to Users)
- `purchaseDate` (Date, Optional)
- `purchasePrice` (Decimal, Optional)
- `insuranceExpiry` (Date, Optional)
- `registrationExpiry` (Date, Optional)
- `lastMaintenanceDate` (Date, Optional)
- `nextMaintenanceDate` (Date, Optional)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### Expenses Table
- `id` (UUID, Primary Key)
- `amount` (Decimal)
- `description` (Text)
- `date` (Date)
- `category` (Enum: fuel, maintenance, repairs, travel, insurance, parking, other)
- `userId` (UUID, Foreign Key to Users)
- `vehicleId` (UUID, Foreign Key to Vehicles, Optional)
- `receiptUrl` (String, Optional)
- `isApproved` (Boolean)
- `approvedBy` (UUID, Foreign Key to Users, Optional)
- `approvedAt` (DateTime, Optional)
- `rejectionReason` (Text, Optional)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

## Development Scripts

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run database migrations
npm run migrate

# Seed database with sample data
npm run seed

# Run linting
npm run lint

# Run tests
npm test
```

## Production Deployment

1. **Set environment to production**:
   ```env
   NODE_ENV=production
   ```

2. **Set secure JWT secrets**:
   Generate strong, unique secrets for JWT_SECRET and JWT_REFRESH_SECRET

3. **Configure production database**:
   Update database credentials for your production MySQL instance

4. **Build the application**:
   ```bash
   npm run build
   ```

5. **Start the production server**:
   ```bash
   npm start
   ```

## Security Features

- **Authentication**: JWT-based authentication with refresh tokens
- **Authorization**: Role-based access control
- **Input Validation**: Joi schema validation for all endpoints
- **Rate Limiting**: Protection against brute force attacks
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers middleware
- **Password Hashing**: Bcrypt for secure password storage

## API Response Format

### Success Response
```json
{
  "message": "Success message",
  "data": { ... },
  "pagination": { ... } // For paginated responses
}
```

### Error Response
```json
{
  "message": "Error message",
  "errors": "Detailed error information"
}
```

## Health Check

The API includes a health check endpoint:

```
GET /health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600.5,
  "environment": "development"
}
```

## Support

For support and questions, please contact the development team or create an issue in the project repository.