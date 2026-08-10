import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide service name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide service description'],
    },
    duration: {
      type: Number,
      required: [true, 'Please specify service duration in minutes'],
      min: [5, 'Duration must be at least 5 minutes'],
    },
    category: {
      type: String,
      required: [true, 'Please specify service category'],
      trim: true,
    },
    price: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative'],
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
serviceSchema.index({ category: 1, isActive: 1 });

const Service = mongoose.model('Service', serviceSchema);
export default Service;
