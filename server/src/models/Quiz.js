const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  options: [String],
  correctAnswers: [String],
  points: {
    type: Number,
    default: 1,
  },
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true,
  },
  questions: [questionSchema],
  passingScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 60,
  },
  timeLimit: {
    type: Number, // minutes
    default: null,
  },
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
});

module.exports = mongoose.model('Quiz', quizSchema);
