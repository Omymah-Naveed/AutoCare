const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerName: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, required: true, trim: true, maxlength: 25, index: true },
    carSubType: {
      type: String,
      enum: ['Hatchback', 'Sedan', 'SUV'],
      required: true,
    },
    carModel: { type: String, required: true, trim: true, maxlength: 100 },
    serviceName: { type: String, required: true, trim: true, maxlength: 120 },
    // Kept as a string because the frontend catalog also supports stable slug IDs.
    serviceId: { type: String, trim: true },
    services: {
      type: [
        {
          serviceId: { type: String, required: true },
          serviceName: { type: String, required: true },
          amount: { type: Number, required: true, min: 0 },
        },
      ],
      default: [],
    },
    date: { type: String, required: true },
    timeSlot: { type: String, required: true, trim: true },
    amount: { type: Number, min: 0 },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    cancellationReason: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Booking', bookingSchema)
