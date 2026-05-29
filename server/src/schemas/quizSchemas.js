const { z } = require('zod');

const questionSchema = z.object({
  text: z.string().min(1),
  options: z.array(z.string()).min(2, 'At least 2 options required'),
  correctAnswers: z.array(z.string()).min(1, 'At least 1 correct answer required'),
  points: z.number().int().min(1).optional().default(1),
});

const importQuizSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  questions: z.array(questionSchema).min(1, 'At least 1 question required'),
  passingScore: z.number().int().min(0).max(100).optional().default(60),
  timeLimit: z.number().int().positive().optional(),
});

const submitQuizSchema = z.object({
  answers: z.array(z.array(z.string())),
});

const thresholdSchema = z.object({
  passingScore: z.number().int().min(0).max(100),
});

module.exports = { importQuizSchema, submitQuizSchema, thresholdSchema };
