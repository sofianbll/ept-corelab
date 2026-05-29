const { authLimiter } = require('../middleware/rateLimiter');

const authRoutes = (router) => {
  const { login, register, firstLogin, me } = require('../controllers/authController');
  const auth = require('../middleware/auth');
  const role = require('../middleware/role');
  const validate = require('../middleware/validate');
  const { loginSchema, registerSchema, firstLoginSchema } = require('../schemas/authSchemas');

  router.post('/login', authLimiter, validate({ body: loginSchema }), login);
  router.post('/register', auth, role('admin'), validate({ body: registerSchema }), register);
  router.post('/first-login', auth, validate({ body: firstLoginSchema }), firstLogin);
  router.get('/me', auth, me);
};

const router = require('express').Router();
authRoutes(router);
module.exports = router;
