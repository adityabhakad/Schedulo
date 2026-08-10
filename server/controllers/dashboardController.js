import User from '../models/User.js';
import Staff from '../models/Staff.js';
import Service from '../models/Service.js';
import Appointment from '../models/Appointment.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get top-level dashboard KPI metrics based on user role
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = asyncHandler(async (req, res) => {
  const { role, _id, email } = req.user;

  if (role === 'admin') {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalStaff = await Staff.countDocuments({});
    const totalServices = await Service.countDocuments({});
    const totalAppointments = await Appointment.countDocuments({});

    const pending = await Appointment.countDocuments({ status: 'PENDING' });
    const confirmed = await Appointment.countDocuments({ status: 'CONFIRMED' });
    const completed = await Appointment.countDocuments({ status: 'COMPLETED' });
    const cancelled = await Appointment.countDocuments({ status: 'CANCELLED' });
    const rejected = await Appointment.countDocuments({ status: 'REJECTED' });

    // Calculate total estimated revenue from COMPLETED appointments
    const completedAppointments = await Appointment.find({ status: 'COMPLETED' }).populate('service', 'price');
    const totalRevenue = completedAppointments.reduce(
      (sum, app) => sum + (app.service?.price || 0),
      0
    );

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalStaff,
        totalServices,
        totalAppointments,
        pending,
        confirmed,
        completed,
        cancelled,
        rejected,
        totalRevenue,
      },
    });
  }

  if (role === 'staff') {
    const staffDoc = await Staff.findOne({ $or: [{ user: _id }, { email }] });
    if (!staffDoc) {
      return res.json({
        success: true,
        data: {
          todayAppointments: 0,
          pendingRequests: 0,
          confirmedAppointments: 0,
          completedAppointments: 0,
          totalAssigned: 0,
        },
      });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayAppointments = await Appointment.countDocuments({
      staff: staffDoc._id,
      appointmentDate: { $gte: todayStart, $lte: todayEnd },
    });

    const pendingRequests = await Appointment.countDocuments({
      staff: staffDoc._id,
      status: 'PENDING',
    });

    const confirmedAppointments = await Appointment.countDocuments({
      staff: staffDoc._id,
      status: 'CONFIRMED',
    });

    const completedAppointments = await Appointment.countDocuments({
      staff: staffDoc._id,
      status: 'COMPLETED',
    });

    const totalAssigned = await Appointment.countDocuments({
      staff: staffDoc._id,
    });

    return res.json({
      success: true,
      data: {
        todayAppointments,
        pendingRequests,
        confirmedAppointments,
        completedAppointments,
        totalAssigned,
      },
    });
  }

  // Role === 'user'
  const totalAppointments = await Appointment.countDocuments({ user: _id });
  const pending = await Appointment.countDocuments({ user: _id, status: 'PENDING' });
  const confirmed = await Appointment.countDocuments({ user: _id, status: 'CONFIRMED' });
  const completed = await Appointment.countDocuments({ user: _id, status: 'COMPLETED' });
  const cancelled = await Appointment.countDocuments({ user: _id, status: 'CANCELLED' });

  // Next upcoming appointment
  const now = new Date();
  const nextAppointment = await Appointment.findOne({
    user: _id,
    status: { $in: ['PENDING', 'CONFIRMED'] },
    appointmentDate: { $gte: new Date(now.setHours(0, 0, 0, 0)) },
  })
    .populate('staff', 'name department specialization profileImage')
    .populate('service', 'name duration category price')
    .sort({ appointmentDate: 1, startTime: 1 });

  return res.json({
    success: true,
    data: {
      totalAppointments,
      pending,
      confirmed,
      completed,
      cancelled,
      nextAppointment,
    },
  });
});

// @desc    Get monthly/daily appointment status aggregations for charts
// @route   GET /api/dashboard/appointments-summary
// @access  Private/Admin
export const getAppointmentsSummary = asyncHandler(async (req, res) => {
  const statusCounts = await Appointment.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const formattedStatusData = statusCounts.map((item) => ({
    name: item._id,
    value: item.count,
  }));

  // Aggregation by Month for trend chart
  const monthlyTrends = await Appointment.aggregate([
    {
      $group: {
        _id: {
          month: { $month: '$appointmentDate' },
          year: { $year: '$appointmentDate' },
        },
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] },
        },
        cancelled: {
          $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] },
        },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedMonthlyTrends = monthlyTrends.map((item) => ({
    month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
    Total: item.total,
    Completed: item.completed,
    Cancelled: item.cancelled,
  }));

  res.json({
    success: true,
    data: {
      statusBreakdown: formattedStatusData,
      monthlyTrends: formattedMonthlyTrends,
    },
  });
});

// @desc    Get popular services & performance stats
// @route   GET /api/dashboard/service-performance
// @access  Private/Admin
export const getServicePerformance = asyncHandler(async (req, res) => {
  const serviceStats = await Appointment.aggregate([
    {
      $group: {
        _id: '$service',
        bookingsCount: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'services',
        localField: '_id',
        foreignField: '_id',
        as: 'serviceDetails',
      },
    },
    {
      $unwind: '$serviceDetails',
    },
    {
      $project: {
        name: '$serviceDetails.name',
        category: '$serviceDetails.category',
        price: '$serviceDetails.price',
        duration: '$serviceDetails.duration',
        bookingsCount: 1,
        totalRevenue: { $multiply: ['$bookingsCount', '$serviceDetails.price'] },
      },
    },
    { $sort: { bookingsCount: -1 } },
  ]);

  res.json({
    success: true,
    data: serviceStats,
  });
});

// @desc    Get staff workload breakdown
// @route   GET /api/dashboard/staff-workload
// @access  Private/Admin
export const getStaffWorkload = asyncHandler(async (req, res) => {
  const workload = await Appointment.aggregate([
    {
      $group: {
        _id: '$staff',
        totalAppointments: { $sum: 1 },
        completedAppointments: {
          $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] },
        },
        pendingAppointments: {
          $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] },
        },
      },
    },
    {
      $lookup: {
        from: 'staffs',
        localField: '_id',
        foreignField: '_id',
        as: 'staffDetails',
      },
    },
    {
      $unwind: '$staffDetails',
    },
    {
      $project: {
        name: '$staffDetails.name',
        department: '$staffDetails.department',
        specialization: '$staffDetails.specialization',
        totalAppointments: 1,
        completedAppointments: 1,
        pendingAppointments: 1,
      },
    },
    { $sort: { totalAppointments: -1 } },
  ]);

  res.json({
    success: true,
    data: workload,
  });
});
