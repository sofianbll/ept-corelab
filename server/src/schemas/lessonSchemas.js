const { z } = require('zod');

const createLessonSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  htmlContent: z.string().min(1, 'HTML content is required'),
  order: z.number().int().optional().default(0),
  mediaUrls: z.array(z.string()).optional().default([]),
});

const updateLessonSchema = z.object({
  title: z.string().optional(),
  htmlContent: z.string().optional(),
  order: z.number().int().optional(),
  mediaUrls: z.array(z.string()).optional(),
});

const scheduleSchema = z.object({
  availableDate: z.string().datetime('Invalid date format'),
});

module.exports = { createLessonSchema, updateLessonSchema, scheduleSchema };
