const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  const filter = { userId: req.user._id };
  if (req.query.read !== undefined) filter.read = req.query.read === 'true';
  const notifications = await Notification.find(filter).sort({ createdAt: -1 });
  res.json(notifications);
};

exports.markAsRead = async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { read: true },
    { new: true }
  );
  if (!notification) return res.status(404).json({ error: 'Not Found', message: 'Notification not found' });
  res.json(notification);
};
