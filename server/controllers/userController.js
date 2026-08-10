import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get all users with search & filtering
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
  const { search, role, isActive } = req.query;

  const query = {};

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { name: { $regex: escaped, $options: 'i' } },
      { email: { $regex: escaped, $options: 'i' } },
      { phone: { $regex: escaped, $options: 'i' } },
    ];
  }

  if (role) {
    query.role = role;
  }

  if (isActive !== undefined && isActive !== '') {
    query.isActive = isActive === 'true';
  }

  const users = await User.find(query).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: users.length,
    data: users,
  });
});

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private (Self or Admin)
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Authorize: Admin or own profile
  if (req.user.role !== 'admin' && req.user._id.toString() !== user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to access this profile');
  }

  res.json({
    success: true,
    data: user,
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Self or Admin)
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (req.user.role !== 'admin' && req.user._id.toString() !== user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this profile');
  }

  user.name = req.body.name || user.name;
  user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
  user.avatar = req.body.avatar || user.avatar;

  // Only admin can change role and active status
  if (req.user.role === 'admin') {
    if (req.body.role) user.role = req.body.role;
    if (req.body.isActive !== undefined) user.isActive = req.body.isActive;
  }

  if (req.body.password) {
    user.password = req.body.password;
  }

  const updatedUser = await user.save();

  res.json({
    success: true,
    data: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      isActive: updatedUser.isActive,
    },
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  await user.deleteOne();

  res.json({
    success: true,
    message: 'User removed successfully',
  });
});
