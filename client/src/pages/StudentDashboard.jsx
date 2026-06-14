import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/axios';

function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      const [coursesResult, progressResult, notificationsResult] = await Promise.allSettled([
        api.courses.list(),
        api.progress.me(),
        api.notifications.list(),
      ]);

      if (coursesResult.status === 'fulfilled') {
        setCourses(coursesResult.value.data || []);
      }
      if (progressResult.status === 'fulfilled') {
        setProgress(progressResult.value || []);
      }
      if (notificationsResult.status === 'fulfilled') {
        setNotifications(notificationsResult.value || []);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Impossible de charger le tableau de bord.');
    } finally {
      setLoading(false);
    }
  }

  const averageProgress = progress.length
    ? Math.round(progress.reduce((total, item) => total + (item.overallProgress || 0), 0) / progress.length)
    : 0;
  const quizAttempts = progress.reduce((total, item) => total + (item.quizResults?.length || 0), 0);
  const unreadNotifications = notifications.filter((notification) => !notification.read).length;

  if (loading) {
    return <div className="panel">Chargement du tableau de bord...</div>;
  }

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Student cockpit</p>
          <h1>Tableau de bord</h1>
        </div>
        <Link className="primary-link" to="/courses">Voir les cours</Link>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="stats-section">
        <div className="stat-card">
          <h3>Cours disponibles</h3>
          <p>{courses.length}</p>
          <span>Catalogue Corelab</span>
        </div>
        <div className="stat-card">
          <h3>Progression</h3>
          <p>{averageProgress}%</p>
          <span>Moyenne de tes parcours</span>
        </div>
        <div className="stat-card">
          <h3>QCM passés</h3>
          <p>{quizAttempts}</p>
          <span>Tentatives enregistrées</span>
        </div>
        <div className="stat-card">
          <h3>Notifications</h3>
          <p>{unreadNotifications}</p>
          <span>Non lues</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-header">
            <h2>Progression</h2>
            <span>{progress.length} parcours</span>
          </div>
          {progress.length === 0 && <p className="empty-text">Aucune progression disponible.</p>}
          {progress.map((item) => (
            <div className="progress-card" key={item._id}>
              <div>
                <strong>{item.courseId?.title || 'Cours'}</strong>
                <span>{item.overallProgress || 0}%</span>
              </div>
              <div className="progress-track">
                <div style={{ width: `${item.overallProgress || 0}%` }} />
              </div>
            </div>
          ))}
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Cours récents</h2>
            <Link to="/courses">Tous</Link>
          </div>
          {courses.slice(0, 4).map((course) => (
            <Link className="list-row" to={`/courses/${course._id}`} key={course._id}>
              <span>📚</span>
              <div>
                <strong>{course.title}</strong>
                <small>{course.category || 'Sans catégorie'}</small>
              </div>
            </Link>
          ))}
          {courses.length === 0 && <p className="empty-text">Aucun cours disponible.</p>}
        </section>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>Notifications</h2>
          <span>{notifications.length}</span>
        </div>
        {notifications.slice(0, 5).map((notification) => (
          <div className="activity-item" key={notification._id}>
            <span>{notification.read ? '✓' : '●'}</span>
            <div>
              <strong>{notification.message}</strong>
              <small>{notification.type}</small>
            </div>
          </div>
        ))}
        {notifications.length === 0 && <p className="empty-text">Aucune notification.</p>}
      </section>
    </div>
  );
}

export default StudentDashboard;
