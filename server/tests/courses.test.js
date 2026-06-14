import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import jwt from 'jsonwebtoken'

let mongoServer
let app
let User
let Course

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret-key-for-testing'
  process.env.NODE_ENV = 'test'

  mongoServer = await MongoMemoryServer.create()
  await mongoose.connect(mongoServer.getUri())

  User = require('../src/models/User')
  Course = require('../src/models/Course')
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
    title: 'Enrolled Course',
    description: 'Student is in this one',
    category: 'math',
    cohorts: [student._id],
    createdBy: admin._id,
  })

  await Course.create({
    title: 'Unenrolled Course',
    description: 'Student is not in this one',
    category: 'science',
    cohorts: [],
    createdBy: admin._id,
  })
})

afterAll(async () => {
  await mongoose.disconnect()
  if (mongoServer) await mongoServer.stop()
})

const tokenFor = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

describe('GET /api/courses', () => {
  it('admin sees all courses', async () => {
    const admin = await User.findOne({ email: 'admin@test.com' })

    const res = await request(app)
      .get('/api/courses')
      .set('Authorization', `Bearer ${tokenFor(admin)}`)
      .expect(200)

    expect(res.body.total).toBe(2)
    expect(res.body.data).toHaveLength(2)
  })

  it('student only sees enrolled courses', async () => {
    const student = await User.findOne({ email: 'student@test.com' })

    const res = await request(app)
      .get('/api/courses')
      .set('Authorization', `Bearer ${tokenFor(student)}`)
      .expect(200)

    expect(res.body.total).toBe(1)
    expect(res.body.data[0].title).toBe('Enrolled Course')
  })
})

describe('POST /api/courses', () => {
  it('admin creates course', async () => {
    const admin = await User.findOne({ email: 'admin@test.com' })

    const res = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${tokenFor(admin)}`)
      .send({ title: 'New Course', description: 'A new course', category: 'coding' })
      .expect(201)

    expect(res.body.title).toBe('New Course')
    expect(res.body.category).toBe('coding')
  })

  it('non-admin returns 403', async () => {
    const student = await User.findOne({ email: 'student@test.com' })

    const res = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${tokenFor(student)}`)
      .send({ title: 'Hack', description: 'Nope', category: 'hack' })
      .expect(403)

    expect(res.body.error).toBe('Forbidden')
  })
})

describe('GET /api/courses/:id', () => {
  it('returns 404 for unknown id', async () => {
    const admin = await User.findOne({ email: 'admin@test.com' })

    const res = await request(app)
      .get(`/api/courses/${new mongoose.Types.ObjectId()}`)
      .set('Authorization', `Bearer ${tokenFor(admin)}`)
      .expect(404)

    expect(res.body.error).toBe('Not Found')
  })
})

describe('POST /api/courses/:id/cohorts', () => {
  it('admin assigns students to cohorts', async () => {
    const admin = await User.findOne({ email: 'admin@test.com' })
    const student = await User.findOne({ email: 'student@test.com' })

    const course = await Course.create({
      title: 'Cohort Test Course',
      description: '',
      category: 'test',
      cohorts: [],
      createdBy: admin._id,
    })

    const res = await request(app)
      .post(`/api/courses/${course._id}/cohorts`)
      .set('Authorization', `Bearer ${tokenFor(admin)}`)
      .send({ userIds: [student._id.toString()] })
      .expect(200)

    expect(res.body.cohorts).toHaveLength(1)
  })
})

describe('GET /api/courses/:id/cohorts', () => {
  it('lists cohort members', async () => {
    const admin = await User.findOne({ email: 'admin@test.com' })
    const student = await User.findOne({ email: 'student@test.com' })

    const course = await Course.create({
      title: 'Cohort List Course',
      description: '',
      category: 'test',
      cohorts: [student._id],
      createdBy: admin._id,
    })

    const res = await request(app)
      .get(`/api/courses/${course._id}/cohorts`)
      .set('Authorization', `Bearer ${tokenFor(admin)}`)
      .expect(200)

    expect(res.body).toHaveLength(1)
    expect(res.body[0].email).toBe('student@test.com')
  })
})
