import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import jwt from 'jsonwebtoken'

let mongoServer
let app
let User
let Course
let Quiz
let Lesson

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret-key-for-testing'
  process.env.NODE_ENV = 'test'

  mongoServer = await MongoMemoryServer.create()
  await mongoose.connect(mongoServer.getUri())

  User = require('../src/models/User')
  Course = require('../src/models/Course')
  Quiz = require('../src/models/Quiz')
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

  await Course.create({
    _id: new mongoose.Types.ObjectId('aaaaaaaaaaaaaaaaaaaaaaaa'),
    title: 'Quiz Course',
    description: 'Course with quizzes',
    category: 'test',
    cohorts: [student._id],
    createdBy: admin._id,
  })

  await Lesson.create({
    title: 'Lesson 1',
    courseId: 'aaaaaaaaaaaaaaaaaaaaaaaa',
    order: 0,
  })
})

afterAll(async () => {
  await mongoose.disconnect()
  if (mongoServer) await mongoServer.stop()
})

const tokenFor = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

describe('GET /api/quizzes/courses/:courseId/quizzes', () => {
  it('returns quizzes for course', async () => {
    const admin = await User.findOne({ email: 'admin@test.com' })
    const courseId = 'aaaaaaaaaaaaaaaaaaaaaaaa'

    await Quiz.create({
      title: 'Quiz 1',
      courseId,
      questions: [{ text: 'Q1', options: ['A', 'B'], correctAnswers: ['A'], points: 1 }],
      passingScore: 50,
    })

    const res = await request(app)
      .get(`/api/quizzes/courses/${courseId}/quizzes`)
      .set('Authorization', `Bearer ${tokenFor(admin)}`)
      .expect(200)

    expect(res.body).toHaveLength(1)
    expect(res.body[0].title).toBe('Quiz 1')
  })
})

describe('POST /api/quizzes/courses/:courseId/quizzes/import', () => {
  it('admin imports quiz', async () => {
    const admin = await User.findOne({ email: 'admin@test.com' })
    const courseId = 'aaaaaaaaaaaaaaaaaaaaaaaa'

    const res = await request(app)
      .post(`/api/quizzes/courses/${courseId}/quizzes/import`)
      .set('Authorization', `Bearer ${tokenFor(admin)}`)
      .send({
        title: 'Imported Quiz',
        questions: [{ text: 'Q?', options: ['Yes', 'No'], correctAnswers: ['Yes'], points: 2 }],
        passingScore: 70,
      })
      .expect(201)

    expect(res.body.title).toBe('Imported Quiz')
    expect(res.body.passingScore).toBe(70)
    expect(res.body.questions).toHaveLength(1)
  })
})

describe('POST /api/quizzes/:id/submit', () => {
  it('student submits answers, gets score + passed', async () => {
    const student = await User.findOne({ email: 'student@test.com' })
    const courseId = 'aaaaaaaaaaaaaaaaaaaaaaaa'

    const quiz = await Quiz.create({
      title: 'Submit Quiz',
      courseId,
      questions: [{ text: 'Q1', options: ['A', 'B'], correctAnswers: ['A'], points: 5 }],
      passingScore: 50,
    })

    const res = await request(app)
      .post(`/api/quizzes/${quiz._id}/submit`)
      .set('Authorization', `Bearer ${tokenFor(student)}`)
      .send({ answers: [['A']] })
      .expect(200)

    expect(res.body.score).toBe(5)
    expect(res.body.passed).toBe(true)
    expect(res.body.attempt).toBeDefined()
  })
})

describe('PUT /api/quizzes/:id/threshold', () => {
  it('admin sets passing score', async () => {
    const admin = await User.findOne({ email: 'admin@test.com' })
    const courseId = 'aaaaaaaaaaaaaaaaaaaaaaaa'

    const quiz = await Quiz.create({
      title: 'Threshold Quiz',
      courseId,
      questions: [{ text: 'Q1', options: ['A', 'B'], correctAnswers: ['A'], points: 1 }],
      passingScore: 60,
    })

    const res = await request(app)
      .put(`/api/quizzes/${quiz._id}/threshold`)
      .set('Authorization', `Bearer ${tokenFor(admin)}`)
      .send({ passingScore: 80 })
      .expect(200)

    expect(res.body.passingScore).toBe(80)
  })
})

describe('GET /api/quizzes/admin/attempts', () => {
  it('admin sees all attempts', async () => {
    const admin = await User.findOne({ email: 'admin@test.com' })
    const student = await User.findOne({ email: 'student@test.com' })
    const courseId = 'aaaaaaaaaaaaaaaaaaaaaaaa'

    const quiz = await Quiz.create({
      title: 'Attempt Quiz',
      courseId,
      questions: [{ text: 'Q1', options: ['A', 'B'], correctAnswers: ['A'], points: 5 }],
      passingScore: 50,
    })

    await request(app)
      .post(`/api/quizzes/${quiz._id}/submit`)
      .set('Authorization', `Bearer ${tokenFor(student)}`)
      .send({ answers: [['A']] })

    const res = await request(app)
      .get(`/api/quizzes/admin/attempts?quizId=${quiz._id}`)
      .set('Authorization', `Bearer ${tokenFor(admin)}`)
      .expect(200)

    expect(res.body).toHaveLength(1)
    expect(res.body[0].score).toBe(5)
  })
})
