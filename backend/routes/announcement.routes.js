const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middleware/auth.middleware');
const {
    getAllAnnouncements,
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement
} = require('../controllers/announcement.controller');

router.use(verifyToken);

// GET /api/announcements
router.get('/', getAllAnnouncements);

// GET /api/announcements/:id
router.get('/:id', getAnnouncementById);

// POST /api/announcements  (teacher or admin)
router.post('/', authorizeRole('teacher', 'admin'), createAnnouncement);

// PUT /api/announcements/:id  (teacher or admin)
router.put('/:id', authorizeRole('teacher', 'admin'), updateAnnouncement);

// DELETE /api/announcements/:id  (teacher or admin)
router.delete('/:id', authorizeRole('teacher', 'admin'), deleteAnnouncement);

module.exports = router;
