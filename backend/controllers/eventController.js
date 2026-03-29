const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Club = require('../models/Club');

// Create event
exports.createEvent = async (req, res, next) => {
  try {
    const { title, description, club, eventType, startDate, endDate, startTime, endTime, location, capacity } = req.body;

    if (!title || !description || !club || !eventType || !location || !capacity) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    const event = await Event.create({
      title,
      description,
      club,
      eventType,
      startDate,
      endDate,
      startTime,
      endTime,
      location,
      capacity,
      organizers: [req.user.id]
    });

    // Add event to club
    await Club.findByIdAndUpdate(club, {
      $push: { events: event._id }
    });

    await event.populate(['club', 'organizers']);

    res.status(201).json({
      success: true,
      event
    });
  } catch (error) {
    next(error);
  }
};

// Get all events
exports.getAllEvents = async (req, res, next) => {
  try {
    const { status, club, eventType } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (club) filter.club = club;
    if (eventType) filter.eventType = eventType;

    const events = await Event.find(filter)
      .populate('club', 'name')
      .populate('organizers', 'name')
      .sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    next(error);
  }
};

// Get event by ID
exports.getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('club')
      .populate('organizers', 'name email')
      .populate('registrations');

    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }

    res.status(200).json({
      success: true,
      event
    });
  } catch (error) {
    next(error);
  }
};

// Update event
exports.updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);

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
        message: 'Not authorized to update this event' 
      });
    }

    const { title, description, eventType, startDate, endDate, startTime, endTime, location, capacity, isRegistrationOpen, status, banner } = req.body;

    event = await Event.findByIdAndUpdate(
      req.params.id,
      { title, description, eventType, startDate, endDate, startTime, endTime, location, capacity, isRegistrationOpen, status, banner, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate(['club', 'organizers']);

    res.status(200).json({
      success: true,
      event
    });
  } catch (error) {
    next(error);
  }
};

// Get events by club
exports.getEventsByClub = async (req, res, next) => {
  try {
    const events = await Event.find({ club: req.params.clubId })
      .populate('organizers', 'name')
      .sort({ startDate: -1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    next(error);
  }
};

// Delete event
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

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
        message: 'Not authorized to delete this event' 
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
