const router = require('express').Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { getMyProgress, getAllStudentsProgress, getStudentProgress } = require('../controllers/progressController');

router.get('/me', auth, role('student'), getMyProgress);
router.get('/students', auth, role('admin'), getAllStudentsProgress);
router.get('/students/:studentId', auth, role('admin'), getStudentProgress);

module.exports = router;
