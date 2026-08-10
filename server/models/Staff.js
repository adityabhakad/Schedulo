import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    name: {
      type: String,
      required: [true, 'Please provide staff name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide staff email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide staff phone number'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Please specify staff department'],
      trim: true,
    },
    specialization: {
      type: String,
      required: [true, 'Please specify staff specialization'],
      trim: true,
    },
    bio: {
      type: String,
      default: '',
    },
    profileImage: {
      type: String,
      default: '',
    },
    workingDays: {
      type: [String],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    workingHours: {
      start: {
        type: String,
        default: '09:00',
      },
      end: {
        type: String,
        default: '17:00',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookup
staffSchema.index({ user: 1 });
staffSchema.index({ department: 1, isActive: 1 });

const Staff = mongoose.model('Staff', staffSchema);
export default Staff;
