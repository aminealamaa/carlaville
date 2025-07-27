import { Router } from 'express';
import Joi from 'joi';
import * as expenseController from '../controllers/expenseController';
import { authenticate, authorize } from '../middleware/auth';
import { validate, validateParams, validateQuery } from '../middleware/validation';

const router = Router();

// Validation schemas
const createExpenseSchema = Joi.object({
  amount: Joi.number().min(0).precision(2).required(),
  description: Joi.string().min(1).max(500).required(),
  date: Joi.date().required(),
  category: Joi.string().valid('fuel', 'maintenance', 'repairs', 'travel', 'insurance', 'parking', 'other').required(),
  vehicleId: Joi.string().uuid().optional().allow(null),
  receiptUrl: Joi.string().uri().optional().allow(null)
});

const updateExpenseSchema = Joi.object({
  amount: Joi.number().min(0).precision(2).optional(),
  description: Joi.string().min(1).max(500).optional(),
  date: Joi.date().optional(),
  category: Joi.string().valid('fuel', 'maintenance', 'repairs', 'travel', 'insurance', 'parking', 'other').optional(),
  vehicleId: Joi.string().uuid().optional().allow(null),
  receiptUrl: Joi.string().uri().optional().allow(null)
});

const rejectExpenseSchema = Joi.object({
  reason: Joi.string().min(1).max(500).required()
});

const uuidParamsSchema = Joi.object({
  id: Joi.string().uuid().required()
});

const expenseQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  category: Joi.string().valid('fuel', 'maintenance', 'repairs', 'travel', 'insurance', 'parking', 'other').optional(),
  status: Joi.string().valid('approved', 'pending', 'rejected').optional(),
  userId: Joi.string().uuid().optional(),
  vehicleId: Joi.string().uuid().optional(),
  dateFrom: Joi.date().optional(),
  dateTo: Joi.date().optional(),
  search: Joi.string().optional(),
  sortBy: Joi.string().valid('createdAt', 'date', 'amount', 'category').default('createdAt'),
  sortOrder: Joi.string().valid('ASC', 'DESC').default('DESC')
});

const statsQuerySchema = Joi.object({
  userId: Joi.string().uuid().optional(),
  dateFrom: Joi.date().optional(),
  dateTo: Joi.date().optional()
});

// Routes
router.get('/', 
  authenticate, 
  validateQuery(expenseQuerySchema), 
  expenseController.getAllExpenses
);

router.get('/stats', 
  authenticate, 
  validateQuery(statsQuerySchema), 
  expenseController.getExpenseStats
);

router.get('/:id', 
  authenticate, 
  validateParams(uuidParamsSchema), 
  expenseController.getExpenseById
);

router.post('/', 
  authenticate, 
  validate(createExpenseSchema), 
  expenseController.createExpense
);

router.put('/:id', 
  authenticate, 
  validateParams(uuidParamsSchema),
  validate(updateExpenseSchema), 
  expenseController.updateExpense
);

router.delete('/:id', 
  authenticate, 
  validateParams(uuidParamsSchema), 
  expenseController.deleteExpense
);

router.patch('/:id/approve', 
  authenticate, 
  authorize(['admin', 'commercial']),
  validateParams(uuidParamsSchema), 
  expenseController.approveExpense
);

router.patch('/:id/reject', 
  authenticate, 
  authorize(['admin', 'commercial']),
  validateParams(uuidParamsSchema),
  validate(rejectExpenseSchema), 
  expenseController.rejectExpense
);

export default router;