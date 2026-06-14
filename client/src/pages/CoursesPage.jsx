import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/axios';

function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      setLoading(true);
      const result = await api.courses.list();
      setCourses(result.data || []);
    } catch (error) {
      setError(error.response?.data?.message || 'Impossible de charger les cours.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="panel">Chargement des cours...</div>;
  }

  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Catalogue</p>
          <h1>Mes cours</h1>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="courses-grid">
        {courses.map((course) => (
          <Link className="course-card" to={`/courses/${course._id}`} key={course._id}>
            <div className="course-icon">📚</div>
            <div>
              <h2>{course.title}</h2>
              <p>{course.description || 'Aucune description disponible.'}</p>
              <span>{course.category || 'Sans catégorie'}</span>
            </div>
          </Link>
        ))}
      </div>

      {courses.length === 0 && <div className="panel">Aucun cours disponible pour le moment.</div>}
    </div>
  );
}

export default CoursesPage;
