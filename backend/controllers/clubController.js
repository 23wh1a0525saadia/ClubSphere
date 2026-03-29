const Club = require('../models/Club');
const User = require('../models/User');

// Create club (admin only)
exports.createClub = async (req, res, next) => {
  try {
    const { name, description, category, email, president } = req.body;

    if (!name || !description || !category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    const club = await Club.create({
      name,
      description,
      category,
      email,
      president: president || req.user.id,
      members: [president || req.user.id]
    });

    await club.populate('president members');

    res.status(201).json({
      success: true,
      club
    });
  } catch (error) {
    next(error);
  }
};

// Get all clubs
exports.getAllClubs = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};

    const clubs = await Club.find(filter)
      .populate('president', 'name email')
      .populate('members', 'name email');

    res.status(200).json({
      success: true,
      count: clubs.length,
      clubs
    });
  } catch (error) {
    next(error);
  }
};

// Get club by ID
exports.getClubById = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('president', 'name email')
      .populate('members', 'name email')
      .populate('events')
      .populate('announcements');

    if (!club) {
      return res.status(404).json({ 
        success: false, 
        message: 'Club not found' 
      });
    }

    res.status(200).json({
      success: true,
      club
    });
  } catch (error) {
    next(error);
  }
};

// Update club
exports.updateClub = async (req, res, next) => {
  try {
    let club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ 
        success: false, 
        message: 'Club not found' 
      });
    }

    // Check authorization
    if (club.president.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this club' 
      });
    }

    const { name, description, category, email, logo, coverImage } = req.body;
    club = await Club.findByIdAndUpdate(
      req.params.id,
      { name, description, category, email, logo, coverImage, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('president members');

    res.status(200).json({
      success: true,
      club
    });
  } catch (error) {
    next(error);
  }
};

// Join club
exports.joinClub = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ 
        success: false, 
        message: 'Club not found' 
      });
    }

    // Check if already member
    if (club.members.includes(req.user.id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Already a member of this club' 
      });
    }

    club.members.push(req.user.id);
    club.memberCount = club.members.length;
    await club.save();

    // Add to user's clubs
    await User.findByIdAndUpdate(req.user.id, {
      $push: { clubsJoined: club._id }
    });

    res.status(200).json({
      success: true,
      message: 'Successfully joined club',
      club
    });
  } catch (error) {
    next(error);
  }
};

// Leave club
exports.leaveClub = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ 
        success: false, 
        message: 'Club not found' 
      });
    }

    if (!club.members.includes(req.user.id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Not a member of this club' 
      });
    }

    club.members = club.members.filter(m => m.toString() !== req.user.id);
    club.memberCount = club.members.length;
    await club.save();

    // Remove from user's clubs
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { clubsJoined: club._id }
    });

    res.status(200).json({
      success: true,
      message: 'Successfully left club',
      club
    });
  } catch (error) {
    next(error);
  }
};

// Delete club (admin or president)
exports.deleteClub = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ 
        success: false, 
        message: 'Club not found' 
      });
    }

    // Check authorization
    if (club.president.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this club' 
      });
    }

    await Club.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Club deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
