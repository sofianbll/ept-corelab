const router = require('express').Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const validate = require('../middleware/validate');
const { createLessonSchema, updateLessonSchema, scheduleSchema } = require('../schemas/lessonSchemas');
const {
  getLessons, createLesson, getLessonById, updateLesson, deleteLesson, scheduleLesson,
} = require('../controllers/lessonController');

router.get('/courses/:courseId/lessons', auth, getLessons);
router.post('/courses/:courseId/lessons', auth, role('admin'), validate({ body: createLessonSchema }), createLesson);
router.get('/:id', auth, getLessonById);
router.put('/:id', auth, role('admin'), validate({ body: updateLessonSchema }), updateLesson);
router.delete('/:id', auth, role('admin'), deleteLesson);
router.put('/:id/schedule', auth, role('admin'), validate({ body: scheduleSchema }), scheduleLesson);

module.exports = router;
