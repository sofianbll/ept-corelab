const Course = require('../models/Course');

exports.getCourses = async (req, res) => {
  const { page = 1, limit = 12, search, sort = 'createdAt:desc' } = req.query;
  const query = {};
  if (search) query.title = { $regex: search, $options: 'i' };

  const [sortField, sortDir] = sort.split(':');
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Course.find(query).sort({ [sortField]: sortDir === 'desc' ? -1 : 1 }).skip(skip).limit(Number(limit)).populate('createdBy', 'name email'),
    Course.countDocuments(query),
  ]);

  res.json({ data, total, page: Number(page), pages: Math.ceil(total / limit) });
};

exports.createCourse = async (req, res) => {
  const course = await Course.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json(await course.populate('createdBy', 'name email'));
};

exports.getCourseById = async (req, res) => {
  const course = await Course.findById(req.params.id).populate('createdBy', 'name email');
  if (!course) return res.status(404).json({ error: 'Not Found', message: 'Course not found' });
  res.json(course);
};

exports.updateCourse = async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!course) return res.status(404).json({ error: 'Not Found', message: 'Course not found' });
  res.json(course);
};

exports.deleteCourse = async (req, res) => {
  const course = await Course.findByIdAndDelete(req.params.id);
  if (!course) return res.status(404).json({ error: 'Not Found', message: 'Course not found' });
  res.status(204).send();
};

exports.getCohorts = async (req, res) => {
  const course = await Course.findById(req.params.id).populate('cohorts', 'name email role firstLogin');
  if (!course) return res.status(404).json({ error: 'Not Found' });
  res.json(course.cohorts);
};

exports.addCohorts = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ error: 'Not Found' });
  const { userIds } = req.body;
  course.cohorts = [...new Set([...course.cohorts.map(String), ...userIds])];
  await course.save();
  res.json(await course.populate('cohorts', 'name email'));
};
