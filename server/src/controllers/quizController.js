const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const Lesson = require('../models/Lesson');

exports.getQuizzes = async (req, res) => {
  if (req.user.role !== 'admin') {
    const course = await Course.findById(req.params.courseId);
    if (!course || !course.cohorts.some(c => c.equals(req.user._id))) {
      return res.json([]);
    }
  }

  const quizzes = await Quiz.find({ courseId: req.params.courseId });
  res.json(quizzes);
};

exports.importQuiz = async (req, res) => {
  const quiz = await Quiz.create({ ...req.body, courseId: req.params.courseId });
  res.status(201).json(quiz);
};

exports.getQuizById = async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) return res.status(404).json({ error: 'Not Found', message: 'Quiz not found' });

  if (req.user.role !== 'admin') {
    const course = await Course.findById(quiz.courseId);
    if (!course || !course.cohorts.some(c => c.equals(req.user._id))) {
      return res.status(404).json({ error: 'Not Found', message: 'Quiz not found' });
    }
  }

  res.json(quiz);
};

exports.updateQuiz = async (req, res) => {
  const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!quiz) return res.status(404).json({ error: 'Not Found' });
  res.json(quiz);
};

exports.deleteQuiz = async (req, res) => {
  const quiz = await Quiz.findByIdAndDelete(req.params.id);
  if (!quiz) return res.status(404).json({ error: 'Not Found' });
  res.status(204).send();
};

exports.setThreshold = async (req, res) => {
  const quiz = await Quiz.findByIdAndUpdate(req.params.id, { passingScore: req.body.passingScore }, { new: true });
  if (!quiz) return res.status(404).json({ error: 'Not Found' });
  res.json(quiz);
};

exports.submitQuiz = async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) return res.status(404).json({ error: 'Not Found', message: 'Quiz not found' });

  let score = 0;
  let maxScore = 0;

  // Calculate score by comparing answers
  for (let i = 0; i < quiz.questions.length; i++) {
    const question = quiz.questions[i];
    const userAnswer = (req.body.answers[i] || []).sort();
    const correct = [...question.correctAnswers].sort();
    maxScore += question.points;
    if (JSON.stringify(userAnswer) === JSON.stringify(correct)) {
      score += question.points;
    }
  }

  const passed = (score / maxScore) * 100 >= quiz.passingScore;

  const attempt = await QuizAttempt.create({
    studentId: req.user._id,
    quizId: quiz._id,
    answers: req.body.answers,
    score,
    passed,
  });

  let progress = await Progress.findOne({ studentId: req.user._id, courseId: quiz.courseId });
  if (!progress) {
    progress = new Progress({ studentId: req.user._id, courseId: quiz.courseId });
  }
  progress.quizResults.push(attempt._id);
  const totalLessons = await Lesson.countDocuments({ courseId: quiz.courseId });
  progress.overallProgress = totalLessons > 0
    ? Math.round((progress.completedLessons.length / totalLessons) * 100)
    : 0;
  await progress.save();

  res.json({
    score,
    passed,
    maxScore,
    attempt: await attempt.populate('studentId', 'name email'),
  });
};

exports.getAllAttempts = async (req, res) => {
  const filter = {};
  if (req.query.quizId) filter.quizId = req.query.quizId;

  const attempts = await QuizAttempt.find(filter)
    .populate('studentId', 'name email')
    .populate({
      path: 'quizId',
      select: 'title courseId',
      populate: { path: 'courseId', select: 'title' },
    });

  res.json(attempts);
};
