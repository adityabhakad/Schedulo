import Service from '../models/Service.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get all services with search, category & active filter
// @route   GET /api/services
// @access  Public / Authenticated
export const getServices = asyncHandler(async (req, res) => {
  const { search, category, isActive } = req.query;

  const query = {};

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { name: { $regex: escaped, $options: 'i' } },
      { description: { $regex: escaped, $options: 'i' } },
      { category: { $regex: escaped, $options: 'i' } },
    ];
  }

  if (category) {
    query.category = category;
  }

  // Non-admins only see active services by default
  if (req.user?.role !== 'admin' || isActive === 'true') {
    query.isActive = true;
  } else if (isActive === 'false') {
    query.isActive = false;
  }

  const services = await Service.find(query).sort({ name: 1 });

  res.json({
    success: true,
    count: services.length,
    data: services,
  });
});

// @desc    Get single service by ID
// @route   GET /api/services/:id
// @access  Public / Authenticated
export const getServiceById = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  res.json({
    success: true,
    data: service,
  });
});

// @desc    Create new service
// @route   POST /api/services
// @access  Private/Admin
export const createService = asyncHandler(async (req, res) => {
  const { name, description, duration, category, price } = req.body;

  if (!name || !description || !duration || !category) {
    res.status(400);
    throw new Error('Please provide name, description, duration, and category');
  }

  const service = await Service.create({
    name,
    description,
    duration: Number(duration),
    category,
    price: price ? Number(price) : 0,
  });

  res.status(201).json({
    success: true,
    data: service,
  });
});

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private/Admin
export const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  service.name = req.body.name || service.name;
  service.description = req.body.description || service.description;
  service.duration = req.body.duration !== undefined ? Number(req.body.duration) : service.duration;
  service.category = req.body.category || service.category;
  service.price = req.body.price !== undefined ? Number(req.body.price) : service.price;
  if (req.body.isActive !== undefined) service.isActive = req.body.isActive;

  const updatedService = await service.save();

  res.json({
    success: true,
    data: updatedService,
  });
});

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private/Admin
export const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  await service.deleteOne();

  res.json({
    success: true,
    message: 'Service deleted successfully',
  });
});
