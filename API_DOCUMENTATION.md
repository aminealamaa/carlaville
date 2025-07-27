# Carlaville Management System - API Documentation

## Overview

The Carlaville Management System backend is a RESTful API built with Express.js, TypeScript, and MySQL. It provides comprehensive endpoints for vehicle management, expense tracking, and user authentication with role-based access control.

## Base URL

```
Development: http://localhost:5000
Production: [Your production URL]
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

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

## Endpoints

### Health Check

#### GET /health
Check if the API is running.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600.5,
  "environment": "development"
}
```

## Authentication Endpoints

### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "jobTitle": "agent", // "agent", "commercial", "admin"
  "phone": "+1234567890" // optional
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "jobTitle": "agent",
    "phone": "+1234567890",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token"
}
```

### POST /api/auth/login
User login.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": { ... },
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token"
}
```

### POST /api/auth/refresh-token
Refresh JWT token.

**Request Body:**
```json
{
  "refreshToken": "refresh-token"
}
```

**Response:**
```json
{
  "accessToken": "new-jwt-token",
  "refreshToken": "new-refresh-token"
}
```

### POST /api/auth/logout
User logout (requires authentication).

**Response:**
```json
{
  "message": "Logout successful"
}
```

### GET /api/auth/profile
Get user profile (requires authentication).

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "jobTitle": "agent",
    "phone": "+1234567890",
    "isActive": true,
    "lastLogin": "2024-01-15T10:30:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### PUT /api/auth/profile
Update user profile (requires authentication).

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890"
}
```

## Vehicle Endpoints

### GET /api/vehicles
Get all vehicles with pagination and filtering (requires authentication).

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `status` (string): Filter by status ("available", "in_use", "maintenance", "retired")
- `search` (string): Search in make, model, license plate, or VIN
- `sortBy` (string): Sort field ("createdAt", "make", "model", "year", "mileage")
- `sortOrder` (string): Sort order ("ASC" or "DESC")

**Response:**
```json
{
  "vehicles": [
    {
      "id": "uuid",
      "make": "Toyota",
      "model": "Camry",
      "year": 2022,
      "licensePlate": "ABC-123",
      "vin": "1HGBH41JXMN109186",
      "fuelType": "gasoline",
      "transmission": "automatic",
      "mileage": 15000,
      "status": "in_use",
      "assignedUser": {
        "id": "uuid",
        "firstName": "John",
        "lastName": "Smith",
        "email": "john@example.com"
      },
      "purchaseDate": "2022-01-15",
      "purchasePrice": 25000,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "pages": 3,
    "limit": 10
  }
}
```

### GET /api/vehicles/:id
Get vehicle by ID (requires authentication).

**Response:**
```json
{
  "vehicle": {
    "id": "uuid",
    "make": "Toyota",
    "model": "Camry",
    // ... other vehicle fields
  }
}
```

### POST /api/vehicles
Create new vehicle (requires admin or commercial role).

**Request Body:**
```json
{
  "make": "Toyota",
  "model": "Camry",
  "year": 2022,
  "licensePlate": "ABC-123",
  "vin": "1HGBH41JXMN109186",
  "fuelType": "gasoline", // "gasoline", "diesel", "electric", "hybrid"
  "transmission": "automatic", // "automatic", "manual"
  "mileage": 15000,
  "status": "available", // "available", "in_use", "maintenance", "retired"
  "assignedUserId": "uuid", // optional
  "purchaseDate": "2022-01-15", // optional
  "purchasePrice": 25000, // optional
  "insuranceExpiry": "2024-01-15", // optional
  "registrationExpiry": "2024-01-15" // optional
}
```

### PUT /api/vehicles/:id
Update vehicle (requires admin or commercial role).

**Request Body:** Same as POST, all fields optional.

### DELETE /api/vehicles/:id
Delete vehicle (requires admin role).

### PATCH /api/vehicles/:id/assign
Assign or unassign vehicle to user (requires admin or commercial role).

**Request Body:**
```json
{
  "userId": "uuid" // or null to unassign
}
```

## Expense Endpoints

### GET /api/expenses
Get expenses with pagination and filtering (requires authentication).

**Query Parameters:**
- `page`, `limit`: Pagination
- `category`: Filter by category ("fuel", "maintenance", "repairs", "travel", "insurance", "parking", "other")
- `status`: Filter by status ("approved", "pending", "rejected")
- `userId`: Filter by user (admin/commercial only)
- `vehicleId`: Filter by vehicle
- `dateFrom`, `dateTo`: Date range filter
- `search`: Search in description
- `sortBy`, `sortOrder`: Sorting

**Note:** Non-admin users only see their own expenses.

**Response:**
```json
{
  "expenses": [
    {
      "id": "uuid",
      "amount": 50.00,
      "description": "Fuel for company vehicle",
      "date": "2024-01-15",
      "category": "fuel",
      "isApproved": true,
      "approvedAt": "2024-01-16T10:30:00.000Z",
      "user": {
        "id": "uuid",
        "firstName": "John",
        "lastName": "Smith",
        "email": "john@example.com"
      },
      "approver": {
        "id": "uuid",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@example.com"
      },
      "vehicle": {
        "id": "uuid",
        "make": "Toyota",
        "model": "Camry",
        "licensePlate": "ABC-123"
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": { ... }
}
```

### GET /api/expenses/stats
Get expense statistics (requires authentication).

**Query Parameters:**
- `userId`: Filter by user (admin/commercial only)
- `dateFrom`, `dateTo`: Date range

**Response:**
```json
{
  "totalAmount": 1250.50,
  "approvedAmount": 800.00,
  "pendingCount": 3,
  "rejectedCount": 1
}
```

### GET /api/expenses/:id
Get expense by ID (requires authentication).

**Note:** Non-admin users can only access their own expenses.

### POST /api/expenses
Create new expense (requires authentication).

**Request Body:**
```json
{
  "amount": 50.00,
  "description": "Fuel for company vehicle",
  "date": "2024-01-15",
  "category": "fuel", // "fuel", "maintenance", "repairs", "travel", "insurance", "parking", "other"
  "vehicleId": "uuid", // optional
  "receiptUrl": "https://example.com/receipt.jpg" // optional
}
```

### PUT /api/expenses/:id
Update expense (requires authentication).

**Note:** 
- Users can only update their own expenses (unless admin)
- Cannot update approved expenses
- Updating resets approval status

### DELETE /api/expenses/:id
Delete expense (requires authentication).

**Note:**
- Users can only delete their own expenses (unless admin)
- Cannot delete approved expenses

### PATCH /api/expenses/:id/approve
Approve expense (requires admin or commercial role).

**Response:**
```json
{
  "message": "Expense approved successfully",
  "expense": { ... }
}
```

### PATCH /api/expenses/:id/reject
Reject expense (requires admin or commercial role).

**Request Body:**
```json
{
  "reason": "Receipt is not clear enough"
}
```

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

## Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Rate Limiting

The API implements rate limiting:
- 100 requests per 15 minutes per IP address
- Exceeded requests return HTTP 429

## Sample Login Credentials

For testing purposes, the seeded database includes:

**Admin User:**
- Email: `admin@carlaville.com`
- Password: `admin123456`

**Commercial Manager:**
- Email: `commercial@carlaville.com`
- Password: `commercial123`

**Agent:**
- Email: `agent1@carlaville.com`
- Password: `agent123456`

## Development Setup

1. Install dependencies: `npm install`
2. Set up environment variables: Copy `.env.example` to `.env`
3. Create MySQL database: `carlaville_db`
4. Run migrations: `npm run migrate`
5. Seed data: `npm run seed`
6. Start development server: `npm run dev`

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure JWT secrets
4. Build: `npm run build`
5. Start: `npm start`

## Support

For technical support, please refer to the README.md or contact the development team.