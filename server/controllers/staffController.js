import Staff from '../models/Staff.js';
import Appointment from '../models/Appointment.js';
import Service from '../models/Service.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  timeToMinutes,
  minutesToTime,
  isOverlapping,
  getDayOfWeek,
  parseDateSafe,
} from '../utils/timeUtils.js';

// @desc    Get all staff members with search, department, and active filtering
// @route   GET /api/staff
// @access  Public / Authenticated
export const getStaff = asyncHandler(async (req, res) => {
  const { search, department, isActive } = req.query;

  const query = {};

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { name: { $regex: escaped, $options: 'i' } },
      { specialization: { $regex: escaped, $options: 'i' } },
      { department: { $regex: escaped, $options: 'i' } },
    ];
  }

  if (department) {
    query.department = department;
  }

  // Non-admins only see active staff by default
  if (req.user?.role !== 'admin' || isActive === 'true') {
    query.isActive = true;
  } else if (isActive === 'false') {
    query.isActive = false;
  }

  const staffList = await Staff.find(query).sort({ name: 1 });

  res.json({
    success: true,
    count: staffList.length,
    data: staffList,
  });
});

// @desc    Get staff member by ID
// @route   GET /api/staff/:id
// @access  Public / Authenticated
export const getStaffById = asyncHandler(async (req, res) => {
  const staff = await Staff.findById(req.params.id);

  if (!staff) {
    res.status(404);
    throw new Error('Staff member not found');
  }

  res.json({
    success: true,
    data: staff,
  });
});

// @desc    Get available time slots for a staff member on a specific date & service
// @route   GET /api/staff/:id/slots
// @access  Public / Authenticated
export const getStaffAvailableSlots = asyncHandler(async (req, res) => {
  const { date, serviceId } = req.query;

  if (!date || !serviceId) {
    res.status(400);
    throw new Error('Please provide date (YYYY-MM-DD) and serviceId');
  }

  const staff = await Staff.findById(req.params.id);
  if (!staff || !staff.isActive) {
    res.status(404);
    throw new Error('Staff member not found or inactive');
  }

  const service = await Service.findById(serviceId);
  if (!service || !service.isActive) {
    res.status(404);
    throw new Error('Service not found or inactive');
  }

  const targetDate = parseDateSafe(date);
  const dayName = getDayOfWeek(targetDate);

  // Check if staff works on this day
  if (!staff.workingDays.includes(dayName)) {
    return res.json({
      success: true,
      dayAvailable: false,
      message: `Staff member does not work on ${dayName}s`,
      slots: [],
    });
  }

  // Calculate start & end of day
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Existing booked appointments
  const existingBookings = await Appointment.find({
    staff: staff._id,
    appointmentDate: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['PENDING', 'CONFIRMED', 'RESCHEDULED'] },
  });

  // Generate candidate 30-minute intervals
  const workStartMin = timeToMinutes(staff.workingHours?.start || '09:00');
  const workEndMin = timeToMinutes(staff.workingHours?.end || '17:00');
  const duration = service.duration;

  const slots = [];
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday = targetDate.getTime() === today.getTime();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (let min = workStartMin; min + duration <= workEndMin; min += 30) {
    const slotStart = minutesToTime(min);
    const slotEnd = minutesToTime(min + duration);

    // Skip past times if date is today
    if (isToday && min <= currentMinutes) {
      continue;
    }

    // Check overlap with existing appointments
    const hasConflict = existingBookings.some((booking) =>
      isOverlapping(slotStart, slotEnd, booking.startTime, booking.endTime)
    );

    if (!hasConflict) {
      slots.push({
        startTime: slotStart,
        endTime: slotEnd,
        available: true,
      });
    }
  }

  res.json({
    success: true,
    dayAvailable: true,
    date,
    dayName,
    slots,
  });
});

// @desc    Create new staff member
// @route   POST /api/staff
// @access  Private/Admin
export const createStaff = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    department,
    specialization,
    bio,
    profileImage,
    workingDays,
    workingHours,
    user,
  } = req.body;

  const existingStaff = await Staff.findOne({ email });
  if (existingStaff) {
    res.status(400);
    throw new Error('Staff member with this email already exists');
  }

  const staff = await Staff.create({
    name,
    email,
    phone,
    department,
    specialization,
    bio: bio || '',
    profileImage: profileImage || '',
    workingDays: workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    workingHours: workingHours || { start: '09:00', end: '17:00' },
    user: user || null,
  });

  res.status(201).json({
    success: true,
    data: staff,
  });
});

// @desc    Update staff member
// @route   PUT /api/staff/:id
// @access  Private/Admin
export const updateStaff = asyncHandler(async (req, res) => {
  const staff = await Staff.findById(req.params.id);

  if (!staff) {
    res.status(404);
    throw new Error('Staff member not found');
  }

  staff.name = req.body.name || staff.name;
  staff.phone = req.body.phone || staff.phone;
  staff.department = req.body.department || staff.department;
  staff.specialization = req.body.specialization || staff.specialization;
  staff.bio = req.body.bio !== undefined ? req.body.bio : staff.bio;
  staff.profileImage = req.body.profileImage !== undefined ? req.body.profileImage : staff.profileImage;
  staff.workingDays = req.body.workingDays || staff.workingDays;
  staff.workingHours = req.body.workingHours || staff.workingHours;
  if (req.body.isActive !== undefined) staff.isActive = req.body.isActive;

  const updatedStaff = await staff.save();

  res.json({
    success: true,
    data: updatedStaff,
  });
});

// @desc    Delete staff member
// @route   DELETE /api/staff/:id
// @access  Private/Admin
export const deleteStaff = asyncHandler(async (req, res) => {
  const staff = await Staff.findById(req.params.id);

  if (!staff) {
    res.status(404);
    throw new Error('Staff member not found');
  }

  await staff.deleteOne();

  res.json({
    success: true,
    message: 'Staff member deleted successfully',
  });
});
