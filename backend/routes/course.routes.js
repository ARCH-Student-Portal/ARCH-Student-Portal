const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middleware/auth.middleware');
const {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    addSection,
    updateSection
} = require('../controllers/course.controller');

router.use(verifyToken);

// GET /api/courses
router.get('/', getAllCourses);

// GET /api/courses/:id
router.get('/:id', getCourseById);

// POST /api/courses  (admin only)
router.post('/', authorizeRole('admin'), createCourse);

// PUT /api/courses/:id  (admin only)
router.put('/:id', authorizeRole('admin'), updateCourse);

// DELETE /api/courses/:id  (admin only)
router.delete('/:id', authorizeRole('admin'), deleteCourse);

// POST /api/courses/:id/sections  (admin only)
router.post('/:id/sections', authorizeRole('admin'), addSection);

// PUT /api/courses/:id/sections/:sectionId  (admin only)
router.put('/:id/sections/:sectionId', authorizeRole('admin'), updateSection);

module.exports = router;
