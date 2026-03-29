const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },
  registrationNumber: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['registered', 'attended', 'cancelled', 'no-show'],
    default: 'registered'
  },
  attendance: {
    type: Boolean,
    default: false
  },
  attendedAt: {
    type: Date,
    default: null
  },
  feedback: {
    type: String,
    maxlength: [500, 'Feedback cannot exceed 500 characters'],
    default: null
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: null
  }
});

// Unique registration per student per event
registrationSchema.index({ event: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
