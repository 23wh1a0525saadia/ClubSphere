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

    if (event.status === 'completed' || event.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Registration is not allowed for this event status'
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

    if (!user.registrationNumber || !user.department) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your profile with registration number and department before registering'
      });
    }

    // Check if already registered
    const existingReg = await Registration.findOne({ event: eventId, student: userId });
    if (existingReg) {
      const eventHasRegistrationRef = Array.isArray(event.registrations)
        ? event.registrations.some((registrationId) => registrationId.toString() === existingReg._id.toString())
        : false;

      // Allow reactivation for any non-active registration or detached reference.
      const isActiveRegistration = existingReg.status === 'registered' && eventHasRegistrationRef;
      if (!isActiveRegistration) {
        existingReg.status = 'registered';
        existingReg.attendance = false;
        existingReg.attendedAt = null;
        existingReg.club = event.club;
        existingReg.registrationNumber = user.registrationNumber;
        existingReg.department = user.department;
        existingReg.registeredAt = new Date();
        await existingReg.save();

        await Event.findByIdAndUpdate(eventId, {
          $addToSet: { registrations: existingReg._id }
        });

        const reactivatedEvent = await Event.findById(eventId);
        if (reactivatedEvent) {
          reactivatedEvent.registrationCount = reactivatedEvent.registrations.length;
          await reactivatedEvent.save();
        }

        await User.findByIdAndUpdate(userId, {
          $addToSet: { eventsRegistered: existingReg._id }
        });

        await existingReg.populate(['event', 'student', 'club']);

        return res.status(200).json({
          success: true,
          message: 'Registration reactivated successfully',
          registration: existingReg
        });
      }

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

    // Keep event registration references deduplicated and count in sync
    await Event.findByIdAndUpdate(eventId, {
      $addToSet: { registrations: registration._id }
    });

    const updatedEvent = await Event.findById(eventId);
    updatedEvent.registrationCount = updatedEvent.registrations.length;
    await updatedEvent.save();

    // Add to user's events
    await User.findByIdAndUpdate(userId, {
      $addToSet: { eventsRegistered: registration._id }
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

// Get my registration status for a specific event
exports.getMyEventRegistration = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const registration = await Registration.findOne({
      event: eventId,
      student: req.user.id
    }).populate('event', 'title startDate location');

    if (!registration) {
      return res.status(200).json({
        success: true,
        registration: null
      });
    }

    return res.status(200).json({
      success: true,
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
    const isOrganizer = event.organizers.some(
      (organizerId) => organizerId.toString() === req.user.id
    );

    if (!isOrganizer && req.user.role !== 'admin') {
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
    const isOrganizer = event.organizers.some(
      (organizerId) => organizerId.toString() === req.user.id
    );

    if (!isOrganizer && req.user.role !== 'admin') {
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
    registration.attendance = false;
    registration.attendedAt = null;
    await registration.save();

    // Remove registration references and keep counts in sync
    await Event.findByIdAndUpdate(registration.event, {
      $pull: { registrations: registrationId }
    });

    const updatedEvent = await Event.findById(registration.event);
    if (updatedEvent) {
      updatedEvent.registrationCount = updatedEvent.registrations.length;
      await updatedEvent.save();
    }

    await User.findByIdAndUpdate(registration.student, {
      $pull: { eventsRegistered: registration._id }
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
