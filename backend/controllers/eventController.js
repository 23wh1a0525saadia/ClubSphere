const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Club = require('../models/Club');
const User = require('../models/User');

// Create event
exports.createEvent = async (req, res, next) => {
  try {
    const { title, description, club, eventType, startDate, endDate, startTime, endTime, location, capacity } = req.body;

    const normalizedTitle = typeof title === 'string' ? title.trim() : '';
    const normalizedLocation = typeof location === 'string' ? location.trim() : '';
    const normalizedEventType = typeof eventType === 'string' ? eventType.trim().toLowerCase() : '';
    const normalizedDescription = typeof description === 'string' ? description.trim() : '';
    const normalizedCapacity = Number(capacity);

    // Only require essential fields
    if (!normalizedTitle || !normalizedEventType || !normalizedLocation || !capacity || !startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide: Title, Event Type, Location, Capacity, Start Date, End Date' 
      });
    }

    if (Number.isNaN(normalizedCapacity) || normalizedCapacity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Capacity must be a positive number'
      });
    }

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    if (club) {
      const clubExists = await Club.findById(club);
      if (!clubExists) {
        return res.status(400).json({
          success: false,
          message: 'Invalid club selected'
        });
      }
    }

    const event = await Event.create({
      title: normalizedTitle,
      description: normalizedDescription,
      club: club || null,
      eventType: normalizedEventType,
      startDate,
      endDate,
      startTime: startTime || '10:00',
      endTime: endTime || '12:00',
      location: normalizedLocation,
      capacity: normalizedCapacity,
      organizers: [req.user.id]
    });

    // Add event to club only if club is provided
    if (club) {
      await Club.findByIdAndUpdate(club, {
        $addToSet: { events: event._id }
      });
    }

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
    const isOrganizer = event.organizers.some(
      (organizerId) => organizerId.toString() === req.user.id
    );

    if (!isOrganizer && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this event' 
      });
    }

    const { title, description, eventType, startDate, endDate, startTime, endTime, location, capacity, isRegistrationOpen, status, banner, club } = req.body;

    const originalClubId = event.club ? event.club.toString() : null;
    const targetClubId = club === '' ? null : (club || originalClubId);

    if (targetClubId) {
      const targetClub = await Club.findById(targetClubId);
      if (!targetClub) {
        return res.status(400).json({
          success: false,
          message: 'Invalid club selected'
        });
      }
    }

    const updates = { updatedAt: Date.now() };

    if (title !== undefined) updates.title = typeof title === 'string' ? title.trim() : title;
    if (description !== undefined) updates.description = typeof description === 'string' ? description.trim() : description;
    if (eventType !== undefined) updates.eventType = typeof eventType === 'string' ? eventType.trim().toLowerCase() : eventType;
    if (startDate !== undefined) updates.startDate = startDate;
    if (endDate !== undefined) updates.endDate = endDate;
    if (startTime !== undefined) updates.startTime = startTime;
    if (endTime !== undefined) updates.endTime = endTime;
    if (location !== undefined) updates.location = typeof location === 'string' ? location.trim() : location;
    if (capacity !== undefined) {
      const normalizedCapacity = Number(capacity);
      if (Number.isNaN(normalizedCapacity) || normalizedCapacity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Capacity must be a positive number'
        });
      }
      updates.capacity = normalizedCapacity;
    }
    if (isRegistrationOpen !== undefined) updates.isRegistrationOpen = isRegistrationOpen;
    if (status !== undefined) updates.status = status;
    if (banner !== undefined) updates.banner = banner;
    updates.club = targetClubId;

    const nextStartDate = updates.startDate || event.startDate;
    const nextEndDate = updates.endDate || event.endDate;
    if (new Date(nextEndDate) < new Date(nextStartDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    event = await Event.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate(['club', 'organizers']);

    if (originalClubId && originalClubId !== targetClubId) {
      await Club.findByIdAndUpdate(originalClubId, {
        $pull: { events: event._id }
      });
    }

    if (targetClubId && originalClubId !== targetClubId) {
      await Club.findByIdAndUpdate(targetClubId, {
        $addToSet: { events: event._id }
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
    const isOrganizer = event.organizers.some(
      (organizerId) => organizerId.toString() === req.user.id
    );

    if (!isOrganizer && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this event' 
      });
    }

    const registrations = await Registration.find({ event: event._id }, '_id student');
    const registrationIds = registrations.map((registration) => registration._id);
    const affectedUserIds = registrations
      .map((registration) => registration.student)
      .filter((studentId) => !!studentId);

    await Promise.all([
      event.club
        ? Club.findByIdAndUpdate(event.club, { $pull: { events: event._id } })
        : Promise.resolve(),
      registrationIds.length > 0
        ? User.updateMany(
            { _id: { $in: affectedUserIds } },
            { $pull: { eventsRegistered: { $in: registrationIds } } }
          )
        : Promise.resolve(),
      Registration.deleteMany({ event: event._id }),
      Event.findByIdAndDelete(req.params.id)
    ]);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
