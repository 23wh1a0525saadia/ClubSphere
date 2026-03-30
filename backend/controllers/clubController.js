const Club = require('../models/Club');
const User = require('../models/User');
const Event = require('../models/Event');

// Create club (admin only)
exports.createClub = async (req, res, next) => {
  try {
    const { name, description, category, email, president } = req.body;

    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedDescription = typeof description === 'string' ? description.trim() : '';
    const normalizedCategory = typeof category === 'string' ? category.trim().toLowerCase() : '';
    const normalizedEmail = typeof email === 'string' && email.trim() !== '' ? email.trim().toLowerCase() : undefined;

    if (!normalizedName || !normalizedDescription || !normalizedCategory) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    const validCategories = ['academic', 'cultural', 'sports', 'technical', 'social', 'professional'];
    if (!validCategories.includes(normalizedCategory)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Allowed values: ${validCategories.join(', ')}`
      });
    }

    const existingClub = await Club.findOne({ name: { $regex: `^${normalizedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } });
    if (existingClub) {
      return res.status(409).json({
        success: false,
        message: 'Club with this name already exists'
      });
    }

    const presidentId = president || req.user.id;
    const presidentUser = await User.findById(presidentId);

    if (!presidentUser) {
      return res.status(400).json({
        success: false,
        message: 'Invalid president user'
      });
    }

    const club = await Club.create({
      name: normalizedName,
      description: normalizedDescription,
      category: normalizedCategory,
      email: normalizedEmail,
      president: presidentId,
      members: [presidentId]
    });

    await User.findByIdAndUpdate(presidentId, {
      $addToSet: { clubsJoined: club._id }
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
    let club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ 
        success: false, 
        message: 'Club not found' 
      });
    }

    // Check if already member
    const alreadyMember = club.members.some(
      (memberId) => memberId.toString() === req.user.id
    );

    if (alreadyMember) {
      return res.status(400).json({ 
        success: false, 
        message: 'Already a member of this club' 
      });
    }

    await Club.findByIdAndUpdate(req.params.id, {
      $addToSet: { members: req.user.id }
    });

    club = await Club.findById(req.params.id);
    club.memberCount = club.members.length;
    await club.save();

    // Add to user's clubs
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { clubsJoined: club._id }
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
    let club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ 
        success: false, 
        message: 'Club not found' 
      });
    }

    if (club.president.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Club president cannot leave the club'
      });
    }

    const isMember = club.members.some(
      (memberId) => memberId.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(400).json({ 
        success: false, 
        message: 'Not a member of this club' 
      });
    }

    await Club.findByIdAndUpdate(req.params.id, {
      $pull: { members: req.user.id }
    });

    club = await Club.findById(req.params.id);
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

    const userIds = club.members.map((memberId) => memberId.toString());

    await Promise.all([
      User.updateMany({ _id: { $in: userIds } }, { $pull: { clubsJoined: club._id } }),
      Event.updateMany({ club: club._id }, { $set: { club: null } })
    ]);

    await Club.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Club deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
