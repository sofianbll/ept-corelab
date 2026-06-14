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
  let users;

  if (req.body.users) {
    users = req.body.users;
  } else if (req.body.raw) {
    const raw = req.body.raw.trim();
    if (raw.startsWith('[') || raw.startsWith('{')) {
      try {
        const parsed = JSON.parse(raw);
        users = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return res.status(400).json({ error: 'Invalid JSON', message: 'Could not parse raw JSON' });
      }
    } else {
      const lines = raw.split('\n').filter(Boolean);
      const [header, ...dataLines] = lines;
      const cols = header.split(',').map((c) => c.trim().toLowerCase());
      users = dataLines.map((line) => {
        const vals = line.split(',').map((v) => v.trim());
        const row = {};
        cols.forEach((col, i) => { row[col] = vals[i]; });
        return row;
      });
    }
  }

  const results = [];
  for (const u of users) {
    const tempPassword = Math.random().toString(36).slice(-10);
    const user = await User.create({
      email: u.email,
      name: u.name,
      role: u.role || 'student',
      password: tempPassword,
    });
    results.push({ _id: user._id, email: user.email, name: user.name, role: user.role });
  }

  res.status(201).json({ imported: results.length, users: results });
};

// GET /api/users/:id
exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ error: 'Not Found', message: 'User not found' });
  res.json(user);
};
