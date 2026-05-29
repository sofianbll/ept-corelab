const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
    index: true,
  },
  answers: [[String]],
  score: {
    type: Number,
    default: 0,
  },
  passed: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: { createdAt: 'submittedAt', updatedAt: false },
});

quizAttemptSchema.index({ studentId: 1, quizId: 1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
