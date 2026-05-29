const Progress = require('../models/Progress');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');

const calculateProgress = async (progress) => {
  const totalLessons = await Lesson.countDocuments({ courseId: progress.courseId });
  if (totalLessons === 0) return 0;
  return Math.round((progress.completedLessons.length / totalLessons) * 100);
};

exports.getMyProgress = async (req, res) => {
  const courses = await Course.find({ cohorts: req.user._id });
  const progressPromises = courses.map(async (course) => {
    let progress = await Progress.findOne({ studentId: req.user._id, courseId: course._id });
    if (!progress) {
      progress = await Progress.create({ studentId: req.user._id, courseId: course._id });
    }
    progress.overallProgress = await calculateProgress(progress);
    await progress.save();
    return progress.populate('courseId', 'title category');
  });
  const results = await Promise.all(progressPromises);
  res.json(results);
};

exports.getAllStudentsProgress = async (req, res) => {
  const filter = {};
  if (req.query.courseId) filter.courseId = req.query.courseId;
  const progress = await Progress.find(filter).populate('studentId', 'name email').populate('courseId', 'title');
  res.json(progress);
};

exports.getStudentProgress = async (req, res) => {
  const progress = await Progress.find({ studentId: req.params.studentId })
    .populate('studentId', 'name email')
    .populate('courseId', 'title');
  res.json(progress);
};
