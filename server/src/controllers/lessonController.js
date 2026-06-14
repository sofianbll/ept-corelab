const Lesson = require('../models/Lesson');
const Notification = require('../models/Notification');
const Course = require('../models/Course');

exports.getLessons = async (req, res) => {
  const query = { courseId: req.params.courseId };

  if (req.user.role !== 'admin') {
    const course = await Course.findById(req.params.courseId);
    if (!course || !course.cohorts.some(c => c.equals(req.user._id))) {
      return res.json([]);
    }
    query.$or = [
      { availableDate: null },
      { availableDate: { $lte: new Date() } },
    ];
  }

  const lessons = await Lesson.find(query).sort({ order: 1 });
  res.json(lessons);
};

exports.createLesson = async (req, res) => {
  const lesson = await Lesson.create({ ...req.body, courseId: req.params.courseId });
  res.status(201).json(lesson);
};

exports.getLessonById = async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) return res.status(404).json({ error: 'Not Found', message: 'Lesson not found' });

  if (req.user.role !== 'admin') {
    const course = await Course.findById(lesson.courseId);
    if (!course || !course.cohorts.some(c => c.equals(req.user._id))) {
      return res.status(404).json({ error: 'Not Found', message: 'Lesson not found' });
    }
    if (lesson.availableDate && lesson.availableDate > new Date()) {
      return res.status(404).json({ error: 'Not Found', message: 'Lesson not found' });
    }
  }

  res.json(lesson);
};

exports.updateLesson = async (req, res) => {
  const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!lesson) return res.status(404).json({ error: 'Not Found' });
  res.json(lesson);
};

exports.deleteLesson = async (req, res) => {
  const lesson = await Lesson.findByIdAndDelete(req.params.id);
  if (!lesson) return res.status(404).json({ error: 'Not Found' });
  res.status(204).send();
};

exports.scheduleLesson = async (req, res) => {
  const lesson = await Lesson.findByIdAndUpdate(req.params.id, { availableDate: req.body.availableDate }, { new: true });
  if (!lesson) return res.status(404).json({ error: 'Not Found' });

  // Notify students in the course cohort
  const course = await Course.findById(lesson.courseId).populate('cohorts');
  if (course && course.cohorts.length > 0) {
    const notifications = course.cohorts.map(student => ({
      userId: student._id,
      type: 'new_lesson',
      message: `Nouvelle leçon disponible : "${lesson.title}"`,
      relatedId: lesson._id,
      relatedModel: 'Lesson',
    }));
    await Notification.insertMany(notifications);
  }

  res.json(lesson);
};
