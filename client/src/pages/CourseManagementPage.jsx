import { useEffect, useState } from 'react';
import { api } from '../api/axios';

const emptyCourse = { title: '', description: '', category: '' };
const emptyLesson = { title: '', htmlContent: '', order: 0, mediaUrls: [] };

function CourseManagementPage() {
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [courseForm, setCourseForm] = useState(emptyCourse);
  const [lessonForm, setLessonForm] = useState(emptyLesson);
  const [quizJson, setQuizJson] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  useEffect(() => {
    if (selectedCourseId) loadCourseChildren(selectedCourseId);
  }, [selectedCourseId]);

  async function loadAdminData() {
    try {
      const [coursesResult, usersResult] = await Promise.all([
        api.courses.list(),
        api.users.list(),
      ]);
      const courseList = coursesResult.data || [];
      setCourses(courseList);
      setUsers(usersResult.data || []);
      setSelectedCourseId(courseList[0]?._id || '');
    } catch (error) {
      setError(error.response?.data?.message || 'Impossible de charger les données admin.');
    }
  }

  async function loadCourseChildren(courseId) {
    const [lessonData, quizData] = await Promise.all([
      api.lessons.listByCourse(courseId),
      api.quizzes.listByCourse(courseId),
    ]);
    setLessons(lessonData || []);
    setQuizzes(quizData || []);
  }

  async function createCourse(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const course = await api.courses.create(courseForm);
      setMessage(`Cours créé : ${course.title}`);
      setCourseForm(emptyCourse);
      await loadAdminData();
    } catch (error) {
      setError(error.response?.data?.message || 'Création du cours impossible.');
    }
  }

  async function createLesson(e) {
    e.preventDefault();
    if (!selectedCourseId) return;
    setError('');
    setMessage('');
    try {
      const payload = { ...lessonForm, order: Number(lessonForm.order) || 0 };
      await api.lessons.create(selectedCourseId, payload);
      setMessage('Leçon créée.');
      setLessonForm(emptyLesson);
      await loadCourseChildren(selectedCourseId);
    } catch (error) {
      setError(error.response?.data?.message || 'Création de la leçon impossible.');
    }
  }

  async function importQuiz(e) {
    e.preventDefault();
    if (!selectedCourseId) return;
    setError('');
    setMessage('');
    try {
      const payload = JSON.parse(quizJson);
      await api.quizzes.import(selectedCourseId, payload);
      setMessage('QCM importé.');
      setQuizJson('');
      await loadCourseChildren(selectedCourseId);
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Import du QCM impossible.');
    }
  }

  async function assignUsers(e) {
    e.preventDefault();
    if (!selectedCourseId) return;
    setError('');
    setMessage('');
    try {
      await api.courses.assignCohorts(selectedCourseId, selectedUsers);
      setMessage('Cohorte mise à jour.');
      setSelectedUsers([]);
    } catch (error) {
      setError(error.response?.data?.message || 'Assignation impossible.');
    }
  }

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Administration</p>
          <h1>Gestion des cours</h1>
        </div>
        <span className="status-pill">{courses.length} cours</span>
      </div>

      {error && <div className="form-error">{error}</div>}
      {message && <div className="form-success">{message}</div>}

      <div className="admin-grid">
        <section className="panel">
          <div className="panel-header"><h2>Nouveau cours</h2></div>
          <form className="admin-form" onSubmit={createCourse}>
            <input placeholder="Titre" value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} />
            <input placeholder="Catégorie" value={courseForm.category} onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })} />
            <textarea placeholder="Description" value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} />
            <button className="primary-button" type="submit">Créer le cours</button>
          </form>
        </section>

        <section className="panel">
          <div className="panel-header"><h2>Cours actif</h2></div>
          <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)}>
            <option value="">Sélectionner un cours</option>
            {courses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}
          </select>
          <div className="mini-list">
            {lessons.map((lesson) => <span key={lesson._id}>Leçon · {lesson.title}</span>)}
            {quizzes.map((quiz) => <span key={quiz._id}>QCM · {quiz.title}</span>)}
          </div>
        </section>
      </div>

      <div className="admin-grid">
        <section className="panel">
          <div className="panel-header"><h2>Créer une leçon HTML</h2></div>
          <form className="admin-form" onSubmit={createLesson}>
            <input placeholder="Titre" value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} />
            <input type="number" placeholder="Ordre" value={lessonForm.order} onChange={(e) => setLessonForm({ ...lessonForm, order: e.target.value })} />
            <textarea placeholder="Contenu HTML" value={lessonForm.htmlContent} onChange={(e) => setLessonForm({ ...lessonForm, htmlContent: e.target.value })} rows={6} />
            <button className="primary-button" type="submit">Créer la leçon</button>
          </form>
        </section>

        <section className="panel">
          <div className="panel-header"><h2>Importer un QCM JSON</h2></div>
          <form className="admin-form" onSubmit={importQuiz}>
            <textarea
              value={quizJson}
              onChange={(e) => setQuizJson(e.target.value)}
              rows={8}
              placeholder='{"title":"Quiz React","questions":[{"text":"React est...","options":["Une librairie","Un langage"],"correctAnswers":["Une librairie"],"points":1}]}'
            />
            <button className="primary-button" type="submit">Importer le QCM</button>
          </form>
        </section>
      </div>

      <section className="panel">
        <div className="panel-header"><h2>Assigner une cohorte</h2></div>
        <form className="admin-form" onSubmit={assignUsers}>
          <select multiple value={selectedUsers} onChange={(e) => setSelectedUsers(Array.from(e.target.selectedOptions, (option) => option.value))}>
            {users.filter((user) => user.role === 'student').map((user) => (
              <option key={user._id} value={user._id}>{user.name} · {user.email}</option>
            ))}
          </select>
          <button className="primary-button" type="submit">Assigner au cours</button>
        </form>
      </section>
    </div>
  );
}

export default CourseManagementPage;
