const express = require('express');
const registrationController = require('../controllers/registrationController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Register for event
router.post('/:eventId', authMiddleware, registrationController.registerForEvent);

// User registrations
router.get('/me/registrations', authMiddleware, registrationController.getUserRegistrations);

// Event registrations (organizer/admin)
router.get('/event/:eventId', authMiddleware, registrationController.getEventRegistrations);

// Attendance
router.put('/:registrationId/attendance', authMiddleware, registrationController.markAttendance);

// Cancel registration
router.delete('/:registrationId', authMiddleware, registrationController.cancelRegistration);

// Feedback
router.put('/:registrationId/feedback', authMiddleware, registrationController.submitFeedback);

module.exports = router;
