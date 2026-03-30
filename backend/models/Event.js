const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide an event title'],
    trim: true,
    maxlength: [150, 'Event title cannot exceed 150 characters']
  },
  description: {
    type: String,
    required: false,
    default: '',
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: false,
    default: null
  },
  banner: {
    type: String,
    default: null
  },
  eventType: {
    type: String,
    enum: ['workshop', 'seminar', 'competition', 'fest', 'social', 'technical', 'other'],
    required: true
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide an end date']
  },
  startTime: {
    type: String,
    required: false,
    default: '10:00'
  },
  endTime: {
    type: String,
    required: false,
    default: '12:00'
  },
  location: {
    type: String,
    required: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  capacity: {
    type: Number,
    required: true,
    min: [1, 'Capacity must be at least 1']
  },
  registrations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration'
  }],
  registrationCount: {
    type: Number,
    default: 0
  },
  isRegistrationOpen: {
    type: Boolean,
    default: true
  },
  organizers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  payment: {
    required: {
      type: Boolean,
      default: false
    },
    amount: {
      type: Number,
      default: 0
    },
    scannerQR: {
      type: String,
      default: null
    },
    description: {
      type: String,
      default: 'Event Registration Fee'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update status based on dates
eventSchema.pre('save', function(next) {
  const now = new Date();
  if (now > this.endDate) {
    this.status = 'completed';
  } else if (now >= this.startDate) {
    this.status = 'ongoing';
  } else {
    this.status = 'upcoming';
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Event', eventSchema);
