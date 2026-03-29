const express = require('express');
const clubController = require('../controllers/clubController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', clubController.getAllClubs);
router.get('/:id', clubController.getClubById);

// Protected routes
router.post('/', authMiddleware, authorize('admin', 'president'), clubController.createClub);
router.put('/:id', authMiddleware, clubController.updateClub);
router.delete('/:id', authMiddleware, clubController.deleteClub);

// Club membership
router.post('/:id/join', authMiddleware, clubController.joinClub);
router.post('/:id/leave', authMiddleware, clubController.leaveClub);

module.exports = router;
