const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const { connectDB } = require('./config/db');
const User = require('./models/User');
const Course = require('./models/Course');
const Lesson = require('./models/Lesson');
const Quiz = require('./models/Quiz');
const QuizAttempt = require('./models/QuizAttempt');
const Progress = require('./models/Progress');
const Notification = require('./models/Notification');

async function seed() {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Course.deleteMany({}),
    Lesson.deleteMany({}),
    Quiz.deleteMany({}),
    QuizAttempt.deleteMany({}),
    Progress.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  const admin = await User.create({
    email: 'admin@corelab.fr',
    password: 'Admin123!',
    name: 'Admin Corelab',
    role: 'admin',
  });

  const students = await User.create([
    { email: 'student1@corelab.fr', password: 'Student123!', name: 'Student One', role: 'student' },
    { email: 'student2@corelab.fr', password: 'Student123!', name: 'Student Two', role: 'student' },
    { email: 'student3@corelab.fr', password: 'Student123!', name: 'Student Three', role: 'student' },
  ]);

  const [reactCourse, nodeCourse] = await Course.create([
    {
      title: 'React — Fondamentaux',
      description: 'Apprenez les bases de React : composants, état, props, hooks et cycle de vie. Ce cours vous guidera à travers la création d\'interfaces utilisateur modernes et réactives.',
      category: 'Frontend',
      createdBy: admin._id,
    },
    {
      title: 'Node.js — API REST',
      description: 'Maîtrisez la création d\'APIs REST avec Node.js, Express et MongoDB. Au programme : routage, middleware, authentification JWT et bonnes pratiques.',
      category: 'Backend',
      createdBy: admin._id,
    },
  ]);

  const reactLessons = await Lesson.create([
    { title: 'Introduction à React', htmlContent: '<h1>Introduction</h1><p>React est une bibliothèque JavaScript pour construire des interfaces utilisateur.</p>', courseId: reactCourse._id, order: 1 },
    { title: 'Composants et Props', htmlContent: '<h1>Composants</h1><p>Les composants sont les briques de base d\'une application React.</p>', courseId: reactCourse._id, order: 2 },
    { title: 'State et Hooks', htmlContent: '<h1>Hooks</h1><p>useState et useEffect sont les hooks fondamentaux de React.</p>', courseId: reactCourse._id, order: 3 },
  ]);

  const nodeLessons = await Lesson.create([
    { title: 'Introduction à Node.js', htmlContent: '<h1>Node.js</h1><p>Node.js est un environnement d\'exécution JavaScript côté serveur.</p>', courseId: nodeCourse._id, order: 1 },
    { title: 'Express et Middleware', htmlContent: '<h1>Express</h1><p>Express est le framework web le plus populaire pour Node.js.</p>', courseId: nodeCourse._id, order: 2 },
    { title: 'Authentification JWT', htmlContent: '<h1>JWT</h1><p>JSON Web Tokens permettent de sécuriser vos APIs REST.</p>', courseId: nodeCourse._id, order: 3 },
  ]);

  const reactQuiz = await Quiz.create({
    title: 'Quiz React — Fondamentaux',
    courseId: reactCourse._id,
    passingScore: 60,
    questions: [
      { text: 'Qu\'est-ce que React ?', options: ['Un framework', 'Une bibliothèque', 'Un langage'], correctAnswers: ['Une bibliothèque'] },
      { text: 'Quel hook gère l\'état local ?', options: ['useEffect', 'useState', 'useContext'], correctAnswers: ['useState'] },
      { text: 'JSX permet...', options: ['D\'écrire du HTML dans JS', 'De gérer une base de données', 'De compiler du CSS'], correctAnswers: ['D\'écrire du HTML dans JS'] },
    ],
  });

  const nodeQuiz = await Quiz.create({
    title: 'Quiz Node.js — API REST',
    courseId: nodeCourse._id,
    passingScore: 60,
    questions: [
      { text: 'Que permet Express ?', options: ['Créer un serveur HTTP', 'Gérer une base SQL', 'Compiler du C++'], correctAnswers: ['Créer un serveur HTTP'] },
      { text: 'Que signifie JWT ?', options: ['Java Web Token', 'JSON Web Token', 'JavaScript Web Tool'], correctAnswers: ['JSON Web Token'] },
      { text: 'Quel statut HTTP pour une création réussie ?', options: ['200', '201', '404'], correctAnswers: ['201'] },
    ],
  });

  const studentIds = students.map(s => s._id);
  await Course.updateMany({}, { $addToSet: { cohorts: { $each: studentIds } } });

  for (const student of students) {
    const reactPassed = await QuizAttempt.create({
      studentId: student._id,
      quizId: reactQuiz._id,
      answers: [['Une bibliothèque'], ['useState'], ['D\'écrire du HTML dans JS']],
      score: 100,
      passed: true,
    });

    const reactFailed = await QuizAttempt.create({
      studentId: student._id,
      quizId: reactQuiz._id,
      answers: [['Un framework'], ['useEffect'], ['De gérer une base de données']],
      score: 0,
      passed: false,
    });

    const nodePassed = await QuizAttempt.create({
      studentId: student._id,
      quizId: nodeQuiz._id,
      answers: [['Créer un serveur HTTP'], ['JSON Web Token'], ['201']],
      score: 100,
      passed: true,
    });

    const nodeFailed = await QuizAttempt.create({
      studentId: student._id,
      quizId: nodeQuiz._id,
      answers: [['Compiler du C++'], ['Java Web Token'], ['404']],
      score: 0,
      passed: false,
    });

    await Progress.create([
      {
        studentId: student._id,
        courseId: reactCourse._id,
        completedLessons: [reactLessons[0]._id, reactLessons[1]._id],
        quizResults: [reactPassed._id, reactFailed._id],
        overallProgress: 66,
      },
      {
        studentId: student._id,
        courseId: nodeCourse._id,
        completedLessons: [nodeLessons[0]._id, nodeLessons[1]._id],
        quizResults: [nodePassed._id, nodeFailed._id],
        overallProgress: 66,
      },
    ]);

    await Notification.create([
      { userId: student._id, type: 'system_update', message: 'Welcome to Corelab' },
      { userId: student._id, type: 'new_lesson', message: 'New lesson available' },
    ]);
  }

  console.log('[Seed] Database populated successfully');
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch(err => {
  console.error('[Seed] Error:', err.message);
  process.exit(1);
});
