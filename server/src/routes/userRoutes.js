const router = require('express').Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const validate = require('../middleware/validate');
const { getUsers, importUsers, getUserById } = require('../controllers/userController');
const { importUsersSchema } = require('../schemas/userSchemas');

router.get('/', auth, role('admin'), getUsers);
router.post('/import', auth, role('admin'), validate({ body: importUsersSchema }), importUsers);
router.get('/:id', auth, role('admin'), getUserById);

module.exports = router;
