const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    index: true,
  },
  cohorts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
});

courseSchema.index({ category: 1, createdAt: -1 });

courseSchema.virtual('lessons', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'courseId',
});

courseSchema.virtual('quizzes', {
  ref: 'Quiz',
  localField: '_id',
  foreignField: 'courseId',
});

courseSchema.set('toJSON', { virtuals: true });
courseSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Course', courseSchema);
