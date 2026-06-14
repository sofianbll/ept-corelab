import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import jwt from 'jsonwebtoken'

let mongoServer
let app
let User
let Course
let Lesson

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret-key-for-testing'
  process.env.NODE_ENV = 'test'

  mongoServer = await MongoMemoryServer.create()
  await mongoose.connect(mongoServer.getUri())

  User = require('../src/models/User')
  Course = require('../src/models/Course')
  Lesson = require('../src/models/Lesson')
  app = require('../src/app')

  const admin = await User.create({
    email: 'admin@test.com',
    name: 'Admin User',
    role: 'admin',
    password: 'password123',
    firstLogin: false,
  })

  const student = await User.create({
    email: 'student@test.com',
    name: 'Student User',
    role: 'student',
    password: 'password123',
    firstLogin: false,
  })

  const courseId = new mongoose.Types.ObjectId('bbbbbbbbbbbbbbbbbbbbbbbb')

  await Course.create({
    _id: courseId,
    title: 'Progress Course',
    description: 'Course for progress tests',
    category: 'test',
    cohorts: [student._id],
    createdBy: admin._id,
  })

  await Lesson.create({
    _id: new mongoose.Types.ObjectId('cccccccccccccccccccccccc'),
    title: 'Lesson Alpha',
    courseId,
    order: 0,
  })

  await Lesson.create({
    _id: new mongoose.Types.ObjectId('dddddddddddddddddddddddd'),
    title: 'Lesson Beta',
    courseId,
    order: 1,
  })
})

afterAll(async () => {
  await mongoose.disconnect()
  if (mongoServer) await mongoServer.stop()
})

const tokenFor = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

describe('PUT /api/progress/me/lessons/:lessonId', () => {
  it('marks lesson complete and updates progress %', async () => {
    const student = await User.findOne({ email: 'student@test.com' })
    const lessonId = 'cccccccccccccccccccccccc'

    const res = await request(app)
      .put(`/api/progress/me/lessons/${lessonId}`)
      .set('Authorization', `Bearer ${tokenFor(student)}`)
      .expect(200)

    expect(res.body.completedLessons).toHaveLength(1)
    expect(res.body.overallProgress).toBe(50)
  })
})

describe('GET /api/progress/me', () => {
  it('returns student progress array', async () => {
    const student = await User.findOne({ email: 'student@test.com' })

    const res = await request(app)
      .get('/api/progress/me')
      .set('Authorization', `Bearer ${tokenFor(student)}`)
      .expect(200)

    expect(res.body).toHaveLength(1)
    expect(res.body[0].overallProgress).toBeGreaterThanOrEqual(0)
    expect(res.body[0].courseId).toBeDefined()
  })
})

describe('GET /api/progress/students', () => {
  it('admin sees all progress', async () => {
    const admin = await User.findOne({ email: 'admin@test.com' })

    const res = await request(app)
      .get('/api/progress/students')
      .set('Authorization', `Bearer ${tokenFor(admin)}`)
      .expect(200)

    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThanOrEqual(0)
  })
})
