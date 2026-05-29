const router = require('express').Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { getUsers, importUsers, getUserById } = require('../controllers/userController');

router.get('/', auth, role('admin'), getUsers);
router.post('/import', auth, role('admin'), importUsers);
router.get('/:id', auth, role('admin'), getUserById);

module.exports = router;
