const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');
const Club = require('../models/Club');

// Register for event
exports.registerForEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }

    if (!event.isRegistrationOpen) {
      return res.status(400).json({ 
        success: false, 
        message: 'Registration for this event is closed' 
      });
    }

    if (event.registrationCount >= event.capacity) {
      return res.status(400).json({ 
        success: false, 
        message: 'Event capacity is full' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if already registered
    const existingReg = await Registration.findOne({ event: eventId, student: userId });
    if (existingReg) {
      return res.status(400).json({ 
        success: false, 
        message: 'Already registered for this event' 
      });
    }

    const registration = await Registration.create({
      event: eventId,
      student: userId,
      club: event.club,
      registrationNumber: user.registrationNumber,
      department: user.department
    });

    // Update event registration count
    event.registrations.push(registration._id);
    event.registrationCount = event.registrations.length;
    await event.save();

    // Add to user's events
    await User.findByIdAndUpdate(userId, {
      $push: { eventsRegistered: registration._id }
    });

    await registration.populate(['event', 'student', 'club']);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      registration
    });
  } catch (error) {
    next(error);
  }
};

// Get user's registrations
exports.getUserRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({ student: req.user.id })
      .populate('event', 'title startDate location')
      .populate('club', 'name')
      .sort({ registeredAt: -1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      registrations
    });
  } catch (error) {
    next(error);
  }
};

// Get event registrations (organizer/admin)
exports.getEventRegistrations = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }

    // Check authorization
    if (!event.organizers.includes(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view registrations' 
      });
    }

    const registrations = await Registration.find({ event: eventId })
      .populate('student', 'name email registrationNumber department')
      .sort({ registeredAt: -1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      registrations
    });
  } catch (error) {
    next(error);
  }
};

// Mark attendance
exports.markAttendance = async (req, res, next) => {
  try {
    const { registrationId } = req.params;
    const { attendance } = req.body;

    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return res.status(404).json({ 
        success: false, 
        message: 'Registration not found' 
      });
    }

    const event = await Event.findById(registration.event);
    
    // Check authorization
    if (!event.organizers.includes(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to mark attendance' 
      });
    }

    registration.attendance = attendance;
    registration.status = attendance ? 'attended' : 'no-show';
    registration.attendedAt = attendance ? new Date() : null;
    await registration.save();

    res.status(200).json({
      success: true,
      message: 'Attendance marked',
      registration
    });
  } catch (error) {
    next(error);
  }
};

// Cancel registration
exports.cancelRegistration = async (req, res, next) => {
  try {
    const { registrationId } = req.params;
    const registration = await Registration.findById(registrationId);

    if (!registration) {
      return res.status(404).json({ 
        success: false, 
        message: 'Registration not found' 
      });
    }

    // Check authorization
    if (registration.student.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to cancel registration' 
      });
    }

    registration.status = 'cancelled';
    await registration.save();

    // Update event count
    await Event.findByIdAndUpdate(registration.event, {
      $pull: { registrations: registrationId }
    });

    res.status(200).json({
      success: true,
      message: 'Registration cancelled',
      registration
    });
  } catch (error) {
    next(error);
  }
};

// Submit feedback
exports.submitFeedback = async (req, res, next) => {
  try {
    const { registrationId } = req.params;
    const { feedback, rating } = req.body;

    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return res.status(404).json({ 
        success: false, 
        message: 'Registration not found' 
      });
    }

    if (registration.student.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to submit feedback' 
      });
    }

    registration.feedback = feedback;
    registration.rating = rating;
    await registration.save();

    res.status(200).json({
      success: true,
      message: 'Feedback submitted',
      registration
    });
  } catch (error) {
    next(error);
  }
};
