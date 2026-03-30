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
    default: null
  },
  registrationNumber: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  department: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
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
  },
  payment: {
    paymentRequired: {
      type: Boolean,
      default: false
    },
    amount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'verified'],
      default: 'pending'
    },
    paymentCode: {
      type: String,
      default: null
    },
    paymentMethod: {
      type: String,
      enum: ['scanner', 'cash', 'online', 'none'],
      default: 'none'
    },
    verifiedAt: {
      type: Date,
      default: null
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  }
});

// Unique registration per student per event
registrationSchema.index({ event: 1, student: 1 }, { unique: true });

registrationSchema.pre('save', function(next) {
  if (this.status === 'cancelled') {
    this.attendance = false;
    this.attendedAt = null;
  } else if (this.attendance) {
    this.status = 'attended';
    this.attendedAt = this.attendedAt || new Date();
  }

  next();
});

module.exports = mongoose.model('Registration', registrationSchema);
