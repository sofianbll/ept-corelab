const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['admin', 'student']),
});

const firstLoginSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

module.exports = { loginSchema, registerSchema, firstLoginSchema };
