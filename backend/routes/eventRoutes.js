const express = require('express');
const eventController = require('../controllers/eventController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);
router.get('/club/:clubId', eventController.getEventsByClub);

// Protected routes
router.post('/', authMiddleware, authorize('president', 'admin'), eventController.createEvent);
router.put('/:id', authMiddleware, eventController.updateEvent);
router.delete('/:id', authMiddleware, eventController.deleteEvent);

module.exports = router;
