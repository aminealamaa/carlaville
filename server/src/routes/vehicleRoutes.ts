import { Router } from 'express';
import Joi from 'joi';
import * as vehicleController from '../controllers/vehicleController';
import { authenticate, authorize } from '../middleware/auth';
import { validate, validateParams, validateQuery } from '../middleware/validation';

const router = Router();

// Validation schemas
const createVehicleSchema = Joi.object({
  make: Joi.string().min(1).max(50).required(),
  model: Joi.string().min(1).max(50).required(),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).required(),
  licensePlate: Joi.string().min(1).max(20).required(),
  vin: Joi.string().length(17).required(),
  fuelType: Joi.string().valid('gasoline', 'diesel', 'electric', 'hybrid').default('gasoline'),
  transmission: Joi.string().valid('automatic', 'manual').default('automatic'),
  mileage: Joi.number().integer().min(0).default(0),
  status: Joi.string().valid('available', 'in_use', 'maintenance', 'retired').default('available'),
  assignedUserId: Joi.string().uuid().optional().allow(null),
  purchaseDate: Joi.date().optional(),
  purchasePrice: Joi.number().min(0).optional(),
  insuranceExpiry: Joi.date().optional(),
  registrationExpiry: Joi.date().optional(),
  lastMaintenanceDate: Joi.date().optional(),
  nextMaintenanceDate: Joi.date().optional()
});

const updateVehicleSchema = Joi.object({
  make: Joi.string().min(1).max(50).optional(),
  model: Joi.string().min(1).max(50).optional(),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).optional(),
  licensePlate: Joi.string().min(1).max(20).optional(),
  vin: Joi.string().length(17).optional(),
  fuelType: Joi.string().valid('gasoline', 'diesel', 'electric', 'hybrid').optional(),
  transmission: Joi.string().valid('automatic', 'manual').optional(),
  mileage: Joi.number().integer().min(0).optional(),
  status: Joi.string().valid('available', 'in_use', 'maintenance', 'retired').optional(),
  assignedUserId: Joi.string().uuid().optional().allow(null),
  purchaseDate: Joi.date().optional().allow(null),
  purchasePrice: Joi.number().min(0).optional().allow(null),
  insuranceExpiry: Joi.date().optional().allow(null),
  registrationExpiry: Joi.date().optional().allow(null),
  lastMaintenanceDate: Joi.date().optional().allow(null),
  nextMaintenanceDate: Joi.date().optional().allow(null)
});

const assignVehicleSchema = Joi.object({
  userId: Joi.string().uuid().optional().allow(null)
});

const uuidParamsSchema = Joi.object({
  id: Joi.string().uuid().required()
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid('available', 'in_use', 'maintenance', 'retired').optional(),
  search: Joi.string().optional(),
  sortBy: Joi.string().valid('createdAt', 'make', 'model', 'year', 'mileage').default('createdAt'),
  sortOrder: Joi.string().valid('ASC', 'DESC').default('DESC')
});

// Routes
router.get('/', 
  authenticate, 
  validateQuery(querySchema), 
  vehicleController.getAllVehicles
);

router.get('/:id', 
  authenticate, 
  validateParams(uuidParamsSchema), 
  vehicleController.getVehicleById
);

router.post('/', 
  authenticate, 
  authorize(['admin', 'commercial']),
  validate(createVehicleSchema), 
  vehicleController.createVehicle
);

router.put('/:id', 
  authenticate, 
  authorize(['admin', 'commercial']),
  validateParams(uuidParamsSchema),
  validate(updateVehicleSchema), 
  vehicleController.updateVehicle
);

router.delete('/:id', 
  authenticate, 
  authorize(['admin']),
  validateParams(uuidParamsSchema), 
  vehicleController.deleteVehicle
);

router.patch('/:id/assign', 
  authenticate, 
  authorize(['admin', 'commercial']),
  validateParams(uuidParamsSchema),
  validate(assignVehicleSchema), 
  vehicleController.assignVehicle
);

export default router;