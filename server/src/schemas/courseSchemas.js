const { z } = require('zod');

const createCourseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().default(''),
  category: z.string().optional(),
});

const updateCourseSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
});

const cohortsSchema = z.object({
  userIds: z.array(z.string()).min(1, 'At least one user ID is required'),
});

module.exports = { createCourseSchema, updateCourseSchema, cohortsSchema };
