const express = require('express');
const authController = require('../controllers/authController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', authMiddleware, authController.getCurrentUser);
router.put('/profile', authMiddleware, authController.updateProfile);
router.get('/:id', authMiddleware, authController.getUserById);

// Admin routes
router.get('/', authMiddleware, authorize('admin'), authController.getAllUsers);

module.exports = router;
