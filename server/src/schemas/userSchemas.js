const { z } = require('zod');

const importUsersSchema = z.object({
  users: z.array(z.object({
    email: z.string().email('Invalid email'),
    name: z.string().min(1, 'Name is required'),
    role: z.enum(['admin', 'student']).default('student'),
  })).optional(),
  raw: z.string().optional(),
}).refine((data) => data.users || data.raw, {
  message: 'Provide either users array or raw text field',
});

module.exports = { importUsersSchema };
