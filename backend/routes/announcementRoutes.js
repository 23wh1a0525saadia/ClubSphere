const express = require('express');
const announcementController = require('../controllers/announcementController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', announcementController.getAllAnnouncements);
router.get('/:id', announcementController.getAnnouncementById);

// Protected routes
router.post('/', authMiddleware, authorize('president', 'admin'), announcementController.createAnnouncement);
router.put('/:id', authMiddleware, announcementController.updateAnnouncement);
router.delete('/:id', authMiddleware, announcementController.deleteAnnouncement);

// Interactions
router.post('/:id/like', authMiddleware, announcementController.likeAnnouncement);
router.post('/:id/comment', authMiddleware, announcementController.addComment);

module.exports = router;
