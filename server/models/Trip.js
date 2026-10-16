import mongoose from 'mongoose';

const expenseSubSchema = new mongoose.Schema({
  id: String,
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  date: { type: String, required: true },
});

const tripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    travelers: {
      type: Number,
      default: 1,
    },
    budget: {
      type: Number,
      default: 1000,
    },
    interests: {
      type: [String],
      default: [],
    },
    selectedHotelId: {
      type: String,
      default: null,
    },
    savedPlaceIds: {
      type: [String],
      default: [],
    },
    expenses: {
      type: [expenseSubSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Trip = mongoose.model('Trip', tripSchema);
