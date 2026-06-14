const router = require('express').Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const validate = require('../middleware/validate');
const { importQuizSchema, submitQuizSchema, thresholdSchema } = require('../schemas/quizSchemas');
const {
  getQuizzes, importQuiz, getQuizById, updateQuiz, deleteQuiz, setThreshold, submitQuiz, getAllAttempts,
} = require('../controllers/quizController');

router.get('/courses/:courseId/quizzes', auth, getQuizzes);
router.post('/courses/:courseId/quizzes/import', auth, role('admin'), validate({ body: importQuizSchema }), importQuiz);
router.get('/:id', auth, getQuizById);
router.put('/:id', auth, role('admin'), updateQuiz);
router.delete('/:id', auth, role('admin'), deleteQuiz);
router.put('/:id/threshold', auth, role('admin'), validate({ body: thresholdSchema }), setThreshold);
router.post('/:id/submit', auth, role('student'), validate({ body: submitQuizSchema }), submitQuiz);
router.get('/admin/attempts', auth, role('admin'), getAllAttempts);

module.exports = router;
