const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['new_lesson', 'quiz_result', 'system_update'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
    index: true,
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel',
  },
  relatedModel: {
    type: String,
    enum: ['Lesson', 'QuizAttempt', 'Course'],
  },
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
});

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
