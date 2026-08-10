import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Appointment must belong to a user'],
    },
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      required: [true, 'Appointment must be assigned to a staff member'],
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Appointment must have a service'],
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Please provide an appointment date'],
    },
    startTime: {
      type: String,
      required: [true, 'Please specify start time (HH:mm format)'],
    },
    endTime: {
      type: String,
      required: [true, 'Please specify end time (HH:mm format)'],
    },
    reason: {
      type: String,
      required: [true, 'Please state the reason for appointment'],
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'REJECTED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster conflict checking and queries
appointmentSchema.index({ staff: 1, appointmentDate: 1, status: 1 });
appointmentSchema.index({ user: 1, appointmentDate: 1, status: 1 });
appointmentSchema.index({ status: 1, appointmentDate: -1 });
appointmentSchema.index({ service: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
