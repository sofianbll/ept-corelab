const User = require('../models/User');

// GET /api/users
exports.getUsers = async (req, res) => {
  const { page = 1, limit = 20, search, sort = 'createdAt:desc' } = req.query;
  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [sortField, sortDir] = sort.split(':');
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    User.find(query).sort({ [sortField]: sortDir === 'desc' ? -1 : 1 }).skip(skip).limit(Number(limit)).select('-password'),
    User.countDocuments(query),
  ]);

  res.json({ data, total, page: Number(page), pages: Math.ceil(total / limit) });
};

// POST /api/users/import
exports.importUsers = async (req, res) => {
  // TODO: handle multipart file upload (CSV / JSON)
  res.status(201).json({ imported: 0 });
};

// GET /api/users/:id
exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ error: 'Not Found', message: 'User not found' });
  res.json(user);
};
