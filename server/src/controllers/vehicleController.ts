import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Vehicle, User } from '../models';
import { AuthRequest } from '../middleware/auth';

export const getAllVehicles = async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const whereClause: any = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (search) {
      whereClause[Op.or] = [
        { make: { [Op.like]: `%${search}%` } },
        { model: { [Op.like]: `%${search}%` } },
        { licensePlate: { [Op.like]: `%${search}%` } },
        { vin: { [Op.like]: `%${search}%` } }
      ];
    }

    const vehicles = await Vehicle.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'assignedUser',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      limit: parseInt(limit as string),
      offset,
      order: [[sortBy as string, sortOrder as string]]
    });

    res.json({
      vehicles: vehicles.rows,
      pagination: {
        total: vehicles.count,
        page: parseInt(page as string),
        pages: Math.ceil(vehicles.count / parseInt(limit as string)),
        limit: parseInt(limit as string)
      }
    });
  } catch (error: any) {
    console.error('Get vehicles error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getVehicleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findByPk(id, {
      include: [
        {
          model: User,
          as: 'assignedUser',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json({ vehicle });
  } catch (error: any) {
    console.error('Get vehicle error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createVehicle = async (req: AuthRequest, res: Response) => {
  try {
    const {
      make,
      model,
      year,
      licensePlate,
      vin,
      fuelType,
      transmission,
      mileage,
      status,
      assignedUserId,
      purchaseDate,
      purchasePrice,
      insuranceExpiry,
      registrationExpiry
    } = req.body;

    // Check if license plate or VIN already exists
    const existingVehicle = await Vehicle.findOne({
      where: {
        [Op.or]: [
          { licensePlate },
          { vin }
        ]
      }
    });

    if (existingVehicle) {
      return res.status(400).json({ 
        message: 'Vehicle with this license plate or VIN already exists' 
      });
    }

    // If assignedUserId is provided, check if user exists
    if (assignedUserId) {
      const user = await User.findByPk(assignedUserId);
      if (!user) {
        return res.status(400).json({ message: 'Assigned user not found' });
      }
    }

    const vehicle = await Vehicle.create({
      make,
      model,
      year,
      licensePlate,
      vin,
      fuelType,
      transmission,
      mileage,
      status,
      assignedUserId,
      purchaseDate,
      purchasePrice,
      insuranceExpiry,
      registrationExpiry
    });

    const createdVehicle = await Vehicle.findByPk(vehicle.id, {
      include: [
        {
          model: User,
          as: 'assignedUser',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    res.status(201).json({
      message: 'Vehicle created successfully',
      vehicle: createdVehicle
    });
  } catch (error: any) {
    console.error('Create vehicle error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Check if license plate or VIN already exists (excluding current vehicle)
    if (updateData.licensePlate || updateData.vin) {
      const existingVehicle = await Vehicle.findOne({
        where: {
          id: { [Op.ne]: id },
          [Op.or]: [
            ...(updateData.licensePlate ? [{ licensePlate: updateData.licensePlate }] : []),
            ...(updateData.vin ? [{ vin: updateData.vin }] : [])
          ]
        }
      });

      if (existingVehicle) {
        return res.status(400).json({ 
          message: 'Vehicle with this license plate or VIN already exists' 
        });
      }
    }

    // If assignedUserId is provided, check if user exists
    if (updateData.assignedUserId) {
      const user = await User.findByPk(updateData.assignedUserId);
      if (!user) {
        return res.status(400).json({ message: 'Assigned user not found' });
      }
    }

    await vehicle.update(updateData);

    const updatedVehicle = await Vehicle.findByPk(id, {
      include: [
        {
          model: User,
          as: 'assignedUser',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    res.json({
      message: 'Vehicle updated successfully',
      vehicle: updatedVehicle
    });
  } catch (error: any) {
    console.error('Update vehicle error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    await vehicle.destroy();

    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error: any) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const assignVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (userId) {
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }
    }

    await vehicle.update({
      assignedUserId: userId || null,
      status: userId ? 'in_use' : 'available'
    });

    const updatedVehicle = await Vehicle.findByPk(id, {
      include: [
        {
          model: User,
          as: 'assignedUser',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    res.json({
      message: userId ? 'Vehicle assigned successfully' : 'Vehicle unassigned successfully',
      vehicle: updatedVehicle
    });
  } catch (error: any) {
    console.error('Assign vehicle error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};