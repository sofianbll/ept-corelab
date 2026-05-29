const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  htmlContent: {
    type: String,
    default: '',
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true,
  },
  order: {
    type: Number,
    required: true,
    default: 0,
  },
  availableDate: {
    type: Date,
    default: null,
  },
  mediaUrls: [String],
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
});

lessonSchema.index({ courseId: 1, order: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);
