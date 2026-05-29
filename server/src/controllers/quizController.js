const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

exports.getQuizzes = async (req, res) => {
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

  res.json({
    score,
    passed,
    maxScore,
    attempt: await attempt.populate('studentId', 'name email'),
  });
};
