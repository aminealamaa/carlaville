import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Expense, User, Vehicle } from '../models';
import { AuthRequest } from '../middleware/auth';

export const getAllExpenses = async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      userId,
      vehicleId,
      dateFrom,
      dateTo,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const whereClause: any = {};
    
    // If user is not admin, only show their own expenses
    if (req.user.jobTitle !== 'admin') {
      whereClause.userId = req.user.id;
    } else if (userId) {
      whereClause.userId = userId;
    }
    
    if (category) {
      whereClause.category = category;
    }
    
    if (status === 'approved') {
      whereClause.isApproved = true;
    } else if (status === 'pending') {
      whereClause.isApproved = false;
      whereClause.rejectionReason = null;
    } else if (status === 'rejected') {
      whereClause.rejectionReason = { [Op.ne]: null };
    }
    
    if (vehicleId) {
      whereClause.vehicleId = vehicleId;
    }
    
    if (dateFrom || dateTo) {
      whereClause.date = {};
      if (dateFrom) {
        whereClause.date[Op.gte] = new Date(dateFrom as string);
      }
      if (dateTo) {
        whereClause.date[Op.lte] = new Date(dateTo as string);
      }
    }
    
    if (search) {
      whereClause.description = { [Op.like]: `%${search}%` };
    }

    const expenses = await Expense.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false
        },
        {
          model: Vehicle,
          as: 'vehicle',
          attributes: ['id', 'make', 'model', 'licensePlate'],
          required: false
        }
      ],
      limit: parseInt(limit as string),
      offset,
      order: [[sortBy as string, sortOrder as string]]
    });

    res.json({
      expenses: expenses.rows,
      pagination: {
        total: expenses.count,
        page: parseInt(page as string),
        pages: Math.ceil(expenses.count / parseInt(limit as string)),
        limit: parseInt(limit as string)
      }
    });
  } catch (error: any) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getExpenseById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const whereClause: any = { id };
    
    // If user is not admin, only allow access to their own expenses
    if (req.user.jobTitle !== 'admin') {
      whereClause.userId = req.user.id;
    }

    const expense = await Expense.findOne({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          required: false
        },
        {
          model: Vehicle,
          as: 'vehicle',
          attributes: ['id', 'make', 'model', 'licensePlate'],
          required: false
        }
      ]
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ expense });
  } catch (error: any) {
    console.error('Get expense error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createExpense = async (req: AuthRequest, res: Response) => {
  try {
    const {
      amount,
      description,
      date,
      category,
      vehicleId,
      receiptUrl
    } = req.body;

    // Validate vehicle exists if provided
    if (vehicleId) {
      const vehicle = await Vehicle.findByPk(vehicleId);
      if (!vehicle) {
        return res.status(400).json({ message: 'Vehicle not found' });
      }
    }

    const expense = await Expense.create({
      amount,
      description,
      date,
      category,
      userId: req.user.id,
      vehicleId,
      receiptUrl
    });

    const createdExpense = await Expense.findByPk(expense.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Vehicle,
          as: 'vehicle',
          attributes: ['id', 'make', 'model', 'licensePlate'],
          required: false
        }
      ]
    });

    res.status(201).json({
      message: 'Expense created successfully',
      expense: createdExpense
    });
  } catch (error: any) {
    console.error('Create expense error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const whereClause: any = { id };
    
    // Users can only update their own expenses, unless they're admin
    if (req.user.jobTitle !== 'admin') {
      whereClause.userId = req.user.id;
    }

    const expense = await Expense.findOne({ where: whereClause });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Don't allow updating approved expenses
    if (expense.isApproved) {
      return res.status(400).json({ message: 'Cannot update approved expense' });
    }

    // Validate vehicle exists if provided
    if (updateData.vehicleId) {
      const vehicle = await Vehicle.findByPk(updateData.vehicleId);
      if (!vehicle) {
        return res.status(400).json({ message: 'Vehicle not found' });
      }
    }

    // Reset approval status if expense is being modified
    const resetFields = {
      isApproved: false,
      approvedBy: undefined,
      approvedAt: undefined,
      rejectionReason: undefined
    };

    await expense.update({ ...updateData, ...resetFields });

    const updatedExpense = await Expense.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Vehicle,
          as: 'vehicle',
          attributes: ['id', 'make', 'model', 'licensePlate'],
          required: false
        }
      ]
    });

    res.json({
      message: 'Expense updated successfully',
      expense: updatedExpense
    });
  } catch (error: any) {
    console.error('Update expense error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const whereClause: any = { id };
    
    // Users can only delete their own expenses, unless they're admin
    if (req.user.jobTitle !== 'admin') {
      whereClause.userId = req.user.id;
    }

    const expense = await Expense.findOne({ where: whereClause });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Don't allow deleting approved expenses
    if (expense.isApproved) {
      return res.status(400).json({ message: 'Cannot delete approved expense' });
    }

    await expense.destroy();

    res.json({ message: 'Expense deleted successfully' });
  } catch (error: any) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const approveExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.isApproved) {
      return res.status(400).json({ message: 'Expense already approved' });
    }

    await expense.update({
      isApproved: true,
      approvedBy: req.user.id,
      approvedAt: new Date(),
      rejectionReason: undefined
    });

    const updatedExpense = await Expense.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Vehicle,
          as: 'vehicle',
          attributes: ['id', 'make', 'model', 'licensePlate'],
          required: false
        }
      ]
    });

    res.json({
      message: 'Expense approved successfully',
      expense: updatedExpense
    });
  } catch (error: any) {
    console.error('Approve expense error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const rejectExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.isApproved) {
      return res.status(400).json({ message: 'Cannot reject approved expense' });
    }

    await expense.update({
      isApproved: false,
      approvedBy: req.user.id,
      approvedAt: new Date(),
      rejectionReason: reason
    });

    const updatedExpense = await Expense.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Vehicle,
          as: 'vehicle',
          attributes: ['id', 'make', 'model', 'licensePlate'],
          required: false
        }
      ]
    });

    res.json({
      message: 'Expense rejected successfully',
      expense: updatedExpense
    });
  } catch (error: any) {
    console.error('Reject expense error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getExpenseStats = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, dateFrom, dateTo } = req.query;
    
    const whereClause: any = {};
    
    // If user is not admin, only show their own stats
    if (req.user.jobTitle !== 'admin') {
      whereClause.userId = req.user.id;
    } else if (userId) {
      whereClause.userId = userId;
    }
    
    if (dateFrom || dateTo) {
      whereClause.date = {};
      if (dateFrom) {
        whereClause.date[Op.gte] = new Date(dateFrom as string);
      }
      if (dateTo) {
        whereClause.date[Op.lte] = new Date(dateTo as string);
      }
    }

    const [totalExpenses, approvedExpenses, pendingExpenses, rejectedExpenses] = await Promise.all([
      Expense.sum('amount', { where: whereClause }),
      Expense.sum('amount', { where: { ...whereClause, isApproved: true } }),
      Expense.count({ where: { ...whereClause, isApproved: false, rejectionReason: null } }),
      Expense.count({ where: { ...whereClause, rejectionReason: { [Op.ne]: null } } })
    ]);

    res.json({
      totalAmount: totalExpenses || 0,
      approvedAmount: approvedExpenses || 0,
      pendingCount: pendingExpenses,
      rejectedCount: rejectedExpenses
    });
  } catch (error: any) {
    console.error('Get expense stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};