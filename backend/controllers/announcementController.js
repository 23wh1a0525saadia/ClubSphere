const Announcement = require('../models/Announcement');
const Club = require('../models/Club');

// Create announcement
exports.createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, club, category, priority } = req.body;

    if (!title || !content || !club) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    const clubDoc = await Club.findById(club);
    
    // Check authorization
    if (clubDoc.president.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to create announcement' 
      });
    }

    const announcement = await Announcement.create({
      title,
      content,
      club,
      createdBy: req.user.id,
      category,
      priority
    });

    // Add to club announcements
    await Club.findByIdAndUpdate(club, {
      $push: { announcements: announcement._id }
    });

    await announcement.populate(['club', 'createdBy']);

    res.status(201).json({
      success: true,
      announcement
    });
  } catch (error) {
    next(error);
  }
};

// Get all announcements
exports.getAllAnnouncements = async (req, res, next) => {
  try {
    const { club, category, priority } = req.query;
    const filter = {};
    
    if (club) filter.club = club;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const announcements = await Announcement.find(filter)
      .populate('club', 'name')
      .populate('createdBy', 'name')
      .populate('comments.user', 'name')
      .sort({ isPinned: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      announcements
    });
  } catch (error) {
    next(error);
  }
};

// Get announcement by ID
exports.getAnnouncementById = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('club', 'name')
      .populate('createdBy', 'name')
      .populate('comments.user', 'name')
      .populate('likes', 'name');

    if (!announcement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Announcement not found' 
      });
    }

    res.status(200).json({
      success: true,
      announcement
    });
  } catch (error) {
    next(error);
  }
};

// Update announcement
exports.updateAnnouncement = async (req, res, next) => {
  try {
    let announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Announcement not found' 
      });
    }

    // Check authorization
    if (announcement.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this announcement' 
      });
    }

    const { title, content, category, priority, isPinned } = req.body;

    announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { title, content, category, priority, isPinned, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate(['club', 'createdBy']);

    res.status(200).json({
      success: true,
      announcement
    });
  } catch (error) {
    next(error);
  }
};

// Like announcement
exports.likeAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Announcement not found' 
      });
    }

    if (announcement.likes.includes(req.user.id)) {
      announcement.likes = announcement.likes.filter(id => id.toString() !== req.user.id);
    } else {
      announcement.likes.push(req.user.id);
    }

    await announcement.save();

    res.status(200).json({
      success: true,
      message: 'Like toggled',
      announcement
    });
  } catch (error) {
    next(error);
  }
};

// Add comment
exports.addComment = async (req, res, next) => {
  try {
    const { text } = req.body;

    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Announcement not found' 
      });
    }

    announcement.comments.push({
      user: req.user.id,
      text,
      createdAt: new Date()
    });

    await announcement.save();
    await announcement.populate('comments.user', 'name');

    res.status(200).json({
      success: true,
      message: 'Comment added',
      announcement
    });
  } catch (error) {
    next(error);
  }
};

// Delete announcement
exports.deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Announcement not found' 
      });
    }

    // Check authorization
    if (announcement.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this announcement' 
      });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Announcement deleted'
    });
  } catch (error) {
    next(error);
  }
};
