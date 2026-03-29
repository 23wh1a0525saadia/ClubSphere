const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a club name'],
    unique: true,
    trim: true,
    maxlength: [100, 'Club name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  president: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vicePrincipal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  secretary: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  category: {
    type: String,
    enum: ['academic', 'cultural', 'sports', 'technical', 'social', 'professional'],
    required: true
  },
  email: {
    type: String,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  logo: {
    type: String,
    default: null
  },
  coverImage: {
    type: String,
    default: null
  },
  events: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  announcements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Announcement'
  }],
  memberCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
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

// Update member count and last modified date
clubSchema.pre('save', async function(next) {
  this.updatedAt = Date.now();
  if (this.isModified('members')) {
    this.memberCount = this.members.length;
  }
  next();
});

module.exports = mongoose.model('Club', clubSchema);
