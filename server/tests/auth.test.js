import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import jwt from 'jsonwebtoken'

let mongoServer
let app
let User

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret-key-for-testing'
  process.env.NODE_ENV = 'test'

  mongoServer = await MongoMemoryServer.create()
  await mongoose.connect(mongoServer.getUri())

  User = require('../src/models/User')
  app = require('../src/app')

  await User.create({
    email: 'admin@test.com',
    name: 'Admin User',
    role: 'admin',
    password: 'password123',
    firstLogin: false,
  })

  await User.create({
    email: 'student@test.com',
    name: 'Student User',
    role: 'student',
    password: 'password123',
    firstLogin: false,
  })
})

afterAll(async () => {
  await mongoose.disconnect()
  if (mongoServer) await mongoServer.stop()
})

describe('POST /api/auth/login', () => {
  it('valid credentials return token + user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'password123' })
      .expect(200)

    expect(res.body.token).toBeDefined()
    expect(res.body.user.email).toBe('admin@test.com')
    expect(res.body.user.role).toBe('admin')
    expect(res.body.user.firstLogin).toBe(false)
  })

  it('invalid password returns 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'wrongpassword' })
      .expect(401)

    expect(res.body.error).toBe('Unauthorized')
  })

  it('unknown email returns 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'password123' })
      .expect(401)

    expect(res.body.error).toBe('Unauthorized')
  })
})

describe('POST /api/auth/register', () => {
  const adminToken = () => jwt.sign({ id: null }, process.env.JWT_SECRET, { expiresIn: '7d' })

  it('admin can create user', async () => {
    const admin = await User.findOne({ email: 'admin@test.com' })
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'newuser@test.com', name: 'New User', role: 'student' })
      .expect(201)

    expect(res.body.email).toBe('newuser@test.com')
    expect(res.body.role).toBe('student')
    expect(res.body.firstLogin).toBe(true)
    expect(res.body.tempPassword).toBeDefined()
  })

  it('non-admin returns 403', async () => {
    const student = await User.findOne({ email: 'student@test.com' })
    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'another@test.com', name: 'Another', role: 'student' })
      .expect(403)

    expect(res.body.error).toBe('Forbidden')
  })

  it('duplicate email returns 409', async () => {
    const admin = await User.findOne({ email: 'admin@test.com' })
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'admin@test.com', name: 'Dup', role: 'student' })
      .expect(409)

    expect(res.body.error).toBe('Conflict')
  })
})

describe('POST /api/auth/first-login', () => {
  it('sets new password and firstLogin becomes false', async () => {
    const user = await User.create({
      email: 'first@test.com',
      name: 'First Timer',
      role: 'student',
      password: 'temppassword',
      firstLogin: true,
    })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

    const res = await request(app)
      .post('/api/auth/first-login')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'newpassword123' })
      .expect(200)

    expect(res.body.firstLogin).toBe(false)
    expect(res.body.email).toBe('first@test.com')
  })
})

describe('GET /api/auth/me', () => {
  it('returns current user with valid token', async () => {
    const admin = await User.findOne({ email: 'admin@test.com' })
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(res.body.email).toBe('admin@test.com')
    expect(res.body.role).toBe('admin')
  })

  it('returns 401 without token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .expect(401)

    expect(res.body.error).toBe('Unauthorized')
  })
})
