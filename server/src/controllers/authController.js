const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

exports.register = async (req, res) => {
  const { email, name, role } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(409).json({ error: 'Conflict', message: 'Email already exists' });
  }

  const tempPassword = Math.random().toString(36).slice(-10);
  const user = await User.create({ email, name, role, password: tempPassword });

  res.status(201).json({
    _id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    firstLogin: user.firstLogin,
    tempPassword,
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials' });
  }

  const token = generateToken(user._id);

  res.json({
    token,
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      firstLogin: user.firstLogin,
    },
  });
};

exports.firstLogin = async (req, res) => {
  const { password } = req.body;
  const user = req.user;

  if (!user.firstLogin) {
    return res.status(400).json({ error: 'Bad Request', message: 'Password already set' });
  }

  user.password = password;
  user.firstLogin = false;
  await user.save();

  res.json({
    _id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    firstLogin: false,
  });
};

exports.me = async (req, res) => {
  res.json(req.user);
};
