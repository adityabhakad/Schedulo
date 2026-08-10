import Appointment from '../models/Appointment.js';
import Staff from '../models/Staff.js';
import Service from '../models/Service.js';
import User from '../models/User.js';
import {
  timeToMinutes,
  isOverlapping,
  getDayOfWeek,
  calculateEndTime,
  formatDateString,
  parseDateSafe,
} from '../utils/timeUtils.js';

export const validateAndPrepareAppointment = async ({
  userId,
  staffId,
  serviceId,
  appointmentDate,
  startTime,
  reason,
  notes,
}) => {
  // 1. Check Date is not in the past
  const targetDate = parseDateSafe(appointmentDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const bookingDateOnly = new Date(targetDate);
  bookingDateOnly.setHours(0, 0, 0, 0);

  if (bookingDateOnly < today) {
    throw new Error('Appointment date cannot be in the past');
  }

  // If booking for today, check start time is not earlier than current time
  const now = new Date();
  if (bookingDateOnly.getTime() === today.getTime()) {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = timeToMinutes(startTime);
    if (startMinutes <= currentMinutes) {
      throw new Error('Appointment time must be in the future');
    }
  }

  // 2. Fetch & Validate Service
  const service = await Service.findById(serviceId);
  if (!service) {
    throw new Error('Selected service not found');
  }
  if (!service.isActive) {
    throw new Error('Selected service is currently inactive');
  }

  // 3. Fetch & Validate Staff
  const staff = await Staff.findById(staffId);
  if (!staff) {
    throw new Error('Selected staff member not found');
  }
  if (!staff.isActive) {
    throw new Error('Selected staff member is currently inactive');
  }

  // 4. Validate Staff Working Days
  const dayName = getDayOfWeek(targetDate);
  if (!staff.workingDays || !staff.workingDays.includes(dayName)) {
    throw new Error(`Staff member ${staff.name} is not available on ${dayName}s`);
  }

  // 5. Calculate End Time based on service duration
  const endTime = calculateEndTime(startTime, service.duration);

  // 6. Validate Staff Working Hours
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);
  const staffWorkStart = timeToMinutes(staff.workingHours?.start || '09:00');
  const staffWorkEnd = timeToMinutes(staff.workingHours?.end || '17:00');

  if (startMin < staffWorkStart || endMin > staffWorkEnd) {
    throw new Error(
      `Appointment time (${startTime} - ${endTime}) falls outside staff working hours (${staff.workingHours?.start || '09:00'} - ${staff.workingHours?.end || '17:00'})`
    );
  }

  // 7. Check for Staff Overlapping Appointments
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const existingStaffAppointments = await Appointment.find({
    staff: staffId,
    appointmentDate: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['PENDING', 'CONFIRMED', 'RESCHEDULED'] },
  });

  for (const existing of existingStaffAppointments) {
    if (isOverlapping(startTime, endTime, existing.startTime, existing.endTime)) {
      throw new Error(
        `Staff member ${staff.name} already has an appointment booked between ${existing.startTime} and ${existing.endTime}`
      );
    }
  }

  // 8. Check for User Overlapping Appointments
  const existingUserAppointments = await Appointment.find({
    user: userId,
    appointmentDate: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['PENDING', 'CONFIRMED', 'RESCHEDULED'] },
  });

  for (const existing of existingUserAppointments) {
    if (isOverlapping(startTime, endTime, existing.startTime, existing.endTime)) {
      throw new Error(
        `You already have another appointment scheduled between ${existing.startTime} and ${existing.endTime}`
      );
    }
  }

  return {
    user: userId,
    staff: staffId,
    service: serviceId,
    appointmentDate: startOfDay,
    startTime,
    endTime,
    reason,
    notes: notes || '',
    status: 'PENDING',
  };
};

/**
 * Check status transition permission & rules
 */
export const validateStatusTransition = async (appointment, newStatus, userRole, userId) => {
  const currentStatus = appointment.status;

  // Terminal states cannot be modified
  if (['COMPLETED', 'REJECTED', 'CANCELLED'].includes(currentStatus)) {
    throw new Error(`Appointment is already in terminal state '${currentStatus}' and cannot be modified`);
  }

  // Permission check for User
  if (userRole === 'user') {
    if (appointment.user.toString() !== userId.toString()) {
      throw new Error('You are only authorized to manage your own appointments');
    }
    if (newStatus !== 'CANCELLED') {
      throw new Error('Users can only cancel their appointments');
    }
  }

  // Permission check for Staff
  if (userRole === 'staff') {
    const staffDoc = await Staff.findOne({
      $or: [{ user: userId }, { email: (await User.findById(userId))?.email }],
    });
    if (!staffDoc || appointment.staff.toString() !== staffDoc._id.toString()) {
      throw new Error('Staff members can only manage appointments assigned to them');
    }
  }

  const validTransitions = {
    PENDING: ['CONFIRMED', 'REJECTED', 'CANCELLED', 'RESCHEDULED'],
    CONFIRMED: ['COMPLETED', 'CANCELLED', 'RESCHEDULED'],
    RESCHEDULED: ['CONFIRMED', 'REJECTED', 'CANCELLED'],
  };

  if (!validTransitions[currentStatus] || !validTransitions[currentStatus].includes(newStatus)) {
    throw new Error(`Invalid status transition from '${currentStatus}' to '${newStatus}'`);
  }

  // When confirming an appointment, re-verify there are no overlapping confirmed appointments
  if (newStatus === 'CONFIRMED') {
    const startOfDay = new Date(appointment.appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(appointment.appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const conflictingConfirmed = await Appointment.findOne({
      _id: { $ne: appointment._id },
      staff: appointment.staff,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: 'CONFIRMED',
    });

    if (conflictingConfirmed && isOverlapping(appointment.startTime, appointment.endTime, conflictingConfirmed.startTime, conflictingConfirmed.endTime)) {
      throw new Error(`Cannot confirm appointment: Staff member already has a confirmed appointment at ${conflictingConfirmed.startTime} - ${conflictingConfirmed.endTime}`);
    }
  }
};

