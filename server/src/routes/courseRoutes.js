const router = require('express').Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const validate = require('../middleware/validate');
const { createCourseSchema, updateCourseSchema, cohortsSchema } = require('../schemas/courseSchemas');
const {
  getCourses, createCourse, getCourseById, updateCourse, deleteCourse,
  getCohorts, addCohorts,
} = require('../controllers/courseController');

router.get('/', getCourses);
router.post('/', auth, role('admin'), validate({ body: createCourseSchema }), createCourse);
router.get('/:id', getCourseById);
router.put('/:id', auth, role('admin'), validate({ body: updateCourseSchema }), updateCourse);
router.delete('/:id', auth, role('admin'), deleteCourse);
router.get('/:id/cohorts', auth, role('admin'), getCohorts);
router.post('/:id/cohorts', auth, role('admin'), validate({ body: cohortsSchema }), addCohorts);

module.exports = router;
