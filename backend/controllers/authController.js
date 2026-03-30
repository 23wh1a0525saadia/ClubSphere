const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Register user
exports.register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      registrationNumber,
      department,
      semester
    } = req.body;

    const normalizedName = typeof name === 'string' ? name.trim() : name;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : email;
    const normalizedRegistrationNumber =
      typeof registrationNumber === 'string' && registrationNumber.trim() !== ''
        ? registrationNumber.trim()
        : undefined;
    const normalizedDepartment =
      typeof department === 'string' && department.trim() !== '' ? department.trim() : undefined;
    const normalizedSemester =
      semester !== undefined && semester !== null && semester !== '' ? Number(semester) : undefined;

    // Validate input
    if (!normalizedName || !normalizedEmail || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }

    const userData = {
      name: normalizedName,
      email: normalizedEmail,
      password,
      role: role || 'student'
    };

    if (normalizedRegistrationNumber) {
      userData.registrationNumber = normalizedRegistrationNumber;
    }

    if (normalizedDepartment) {
      userData.department = normalizedDepartment;
    }

    if (normalizedSemester !== undefined && !Number.isNaN(normalizedSemester)) {
      userData.semester = normalizedSemester;
    }

    // Create user
    const user = await User.create(userData);

    // Remove password from response
    user.password = undefined;

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : email;

    // Validate input
    if (!normalizedEmail || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    // Get user with password
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    user.password = undefined;

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('clubsJoined', 'name category')
      .populate({
        path: 'eventsRegistered',
        select: 'status event',
        populate: {
          path: 'event',
          select: 'title startDate location eventType status'
        }
      });

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, department, semester, profileImage } = req.body;

    const updates = { updatedAt: Date.now() };

    if (typeof name === 'string' && name.trim() !== '') {
      updates.name = name.trim();
    }

    if (typeof department === 'string' && department.trim() !== '') {
      updates.department = department.trim().toUpperCase();
    }

    if (semester !== undefined && semester !== null && semester !== '') {
      const normalizedSemester = Number(semester);
      if (Number.isNaN(normalizedSemester)) {
        return res.status(400).json({
          success: false,
          message: 'Semester must be a number'
        });
      }
      updates.semester = normalizedSemester;
    }

    if (profileImage !== undefined) {
      updates.profileImage = profileImage;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// Get user by ID
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('clubsJoined', 'name category')
      .populate({
        path: 'eventsRegistered',
        select: 'status event',
        populate: {
          path: 'event',
          select: 'title startDate location eventType status'
        }
      });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};
