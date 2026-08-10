import Appointment from '../models/Appointment.js';
import Staff from '../models/Staff.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  validateAndPrepareAppointment,
  validateStatusTransition,
} from '../services/appointmentService.js';
import { parseDateSafe } from '../utils/timeUtils.js';

// @desc    Get appointments with search, filter, pagination
// @route   GET /api/appointments
// @access  Private
export const getAppointments = asyncHandler(async (req, res) => {
  const { search, status, staff, service, date, startDate, endDate } = req.query;

  const query = {};

  // Role-based scope filtering
  if (req.user.role === 'user') {
    query.user = req.user._id;
  } else if (req.user.role === 'staff') {
    // Find staff document associated with this user
    const staffDoc = await Staff.findOne({
      $or: [{ user: req.user._id }, { email: req.user.email }],
    });
    if (staffDoc) {
      query.staff = staffDoc._id;
    } else {
      return res.json({ success: true, count: 0, data: [] });
    }
  }

  // Optional filters
  if (status) {
    query.status = status;
  }

  if (staff && req.user.role === 'admin') {
    query.staff = staff;
  }

  if (service) {
    query.service = service;
  }

  if (date) {
    const targetDate = parseDateSafe(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    query.appointmentDate = { $gte: startOfDay, $lte: endOfDay };
  } else if (startDate || endDate) {
    query.appointmentDate = {};
    if (startDate) query.appointmentDate.$gte = parseDateSafe(startDate);
    if (endDate) {
      const end = parseDateSafe(endDate);
      end.setHours(23, 59, 59, 999);
      query.appointmentDate.$lte = end;
    }
  }

  let appointments = await Appointment.find(query)
    .populate('user', 'name email phone avatar')
    .populate('staff', 'name email phone department specialization profileImage')
    .populate('service', 'name description duration price category')
    .sort({ appointmentDate: 1, startTime: 1 });

  // In-memory text search on populated fields if search string provided
  if (search) {
    const term = search.toLowerCase();
    appointments = appointments.filter(
      (app) =>
        app.user?.name?.toLowerCase().includes(term) ||
        app.user?.email?.toLowerCase().includes(term) ||
        app.staff?.name?.toLowerCase().includes(term) ||
        app.service?.name?.toLowerCase().includes(term) ||
        app.reason?.toLowerCase().includes(term)
    );
  }

  res.json({
    success: true,
    count: appointments.length,
    data: appointments,
  });
});

// @desc    Get single appointment details
// @route   GET /api/appointments/:id
// @access  Private
export const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('user', 'name email phone avatar')
    .populate('staff', 'name email phone department specialization bio profileImage workingHours')
    .populate('service', 'name description duration price category');

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  // Authorization check
  if (req.user.role === 'user' && appointment.user._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to access this appointment');
  }

  if (req.user.role === 'staff') {
    const staffDoc = await Staff.findOne({
      $or: [{ user: req.user._id }, { email: req.user.email }],
    });
    if (!staffDoc || appointment.staff._id.toString() !== staffDoc._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to access this appointment');
    }
  }

  res.json({
    success: true,
    data: appointment,
  });
});

// @desc    Create a new appointment with full backend validations
// @route   POST /api/appointments
// @access  Private
export const createAppointment = asyncHandler(async (req, res) => {
  const { staff, service, appointmentDate, startTime, reason, notes } = req.body;

  if (!staff || !service || !appointmentDate || !startTime || !reason) {
    res.status(400);
    throw new Error('Please provide staff, service, appointmentDate, startTime, and reason');
  }

  const appointmentData = await validateAndPrepareAppointment({
    userId: req.user._id,
    staffId: staff,
    serviceId: service,
    appointmentDate,
    startTime,
    reason,
    notes,
  });

  const newAppointment = await Appointment.create(appointmentData);

  const populatedAppointment = await Appointment.findById(newAppointment._id)
    .populate('user', 'name email phone avatar')
    .populate('staff', 'name email phone department specialization profileImage')
    .populate('service', 'name description duration price category');

  res.status(201).json({
    success: true,
    data: populatedAppointment,
  });
});

// @desc    Update appointment status (CONFIRMED, REJECTED, COMPLETED, CANCELLED, RESCHEDULED)
// @route   PATCH /api/appointments/:id/status
// @access  Private
export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status, rejectionReason, cancellationReason, newDate, newStartTime } = req.body;

  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  // Validate status transition permissions
  await validateStatusTransition(appointment, status, req.user.role, req.user._id);

  if (status === 'REJECTED') {
    appointment.rejectionReason = rejectionReason || 'Rejected by staff/administration';
  }

  if (status === 'CANCELLED') {
    appointment.cancellationReason = cancellationReason || 'Cancelled by user';
  }

  if (status === 'RESCHEDULED') {
    if (!newDate || !newStartTime) {
      res.status(400);
      throw new Error('Please provide newDate and newStartTime to reschedule');
    }
    // Re-verify availability for rescheduled time
    const validatedData = await validateAndPrepareAppointment({
      userId: appointment.user,
      staffId: appointment.staff,
      serviceId: appointment.service,
      appointmentDate: newDate,
      startTime: newStartTime,
      reason: appointment.reason,
      notes: appointment.notes,
    });

    appointment.appointmentDate = validatedData.appointmentDate;
    appointment.startTime = validatedData.startTime;
    appointment.endTime = validatedData.endTime;
  }

  appointment.status = status;

  const updatedAppointment = await appointment.save();

  const populated = await Appointment.findById(updatedAppointment._id)
    .populate('user', 'name email phone avatar')
    .populate('staff', 'name email phone department specialization profileImage')
    .populate('service', 'name description duration price category');

  res.json({
    success: true,
    data: populated,
  });
});

// @desc    Update full appointment details (Admin only)
// @route   PUT /api/appointments/:id
// @access  Private/Admin
export const updateAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  if (req.body.reason) appointment.reason = req.body.reason;
  if (req.body.notes !== undefined) appointment.notes = req.body.notes;
  if (req.body.status) appointment.status = req.body.status;

  const updated = await appointment.save();

  const populated = await Appointment.findById(updated._id)
    .populate('user', 'name email phone avatar')
    .populate('staff', 'name email phone department specialization profileImage')
    .populate('service', 'name description duration price category');

  res.json({
    success: true,
    data: populated,
  });
});

// @desc    Delete appointment (Admin only)
// @route   DELETE /api/appointments/:id
// @access  Private/Admin
export const deleteAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  await appointment.deleteOne();

  res.json({
    success: true,
    message: 'Appointment deleted successfully',
  });
});
