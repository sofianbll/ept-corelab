import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/axios';

function CourseDetailPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  async function loadCourse() {
    try {
      setLoading(true);
      const [courseData, lessonData, quizData] = await Promise.all([
        api.courses.get(courseId),
        api.lessons.listByCourse(courseId),
        api.quizzes.listByCourse(courseId),
      ]);
      setCourse(courseData);
      setLessons(lessonData || []);
      setQuizzes(quizData || []);
      setCurrentLesson(lessonData?.[0] || null);
    } catch (error) {
      setError(error.response?.data?.message || 'Impossible de charger ce cours.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="panel">Chargement du cours...</div>;
  }

  return (
    <div className="page-stack">
      <div className="course-hero">
        <div>
          <p className="eyebrow">{course?.category || 'Cours'}</p>
          <h1>{course?.title || 'Cours introuvable'}</h1>
          <p>{course?.description || 'Aucune description disponible.'}</p>
        </div>
        <div className="hero-meter">
          <strong>{lessons.length}</strong>
          <span>leçons</span>
          <small>{quizzes.length} QCM</small>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="course-layout">
        <section className="panel">
          <div className="panel-header">
            <h2>Leçons</h2>
            <span>{lessons.length}</span>
          </div>
          {lessons.map((lesson, index) => (
            <button className="lesson-row" type="button" key={lesson._id} onClick={() => setCurrentLesson(lesson)}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <strong>{lesson.title}</strong>
                <small>{lesson.availableDate ? new Date(lesson.availableDate).toLocaleDateString() : 'Disponible'}</small>
              </div>
            </button>
          ))}
          {lessons.length === 0 && <p className="empty-text">Aucune leçon dans ce cours.</p>}
        </section>

        <section className="panel lesson-reader">
          <div className="panel-header">
            <h2>{currentLesson?.title || 'Leçon'}</h2>
          </div>
          {currentLesson ? (
            <>
              <div className="lesson-html" dangerouslySetInnerHTML={{ __html: currentLesson.htmlContent }} />
              {currentLesson.mediaUrls?.length > 0 && (
                <div className="resource-list">
                  {currentLesson.mediaUrls.map((url) => (
                    <a href={url} target="_blank" rel="noreferrer" key={url}>Ressource</a>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="empty-text">Sélectionne une leçon.</p>
          )}
        </section>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>QCM</h2>
          <span>{quizzes.length}</span>
        </div>
        <div className="quiz-grid">
          {quizzes.map((quiz) => (
            <Link className="quiz-card" to={`/quizzes/${quiz._id}`} key={quiz._id}>
              <strong>{quiz.title}</strong>
              <span>Seuil {quiz.passingScore}%</span>
            </Link>
          ))}
        </div>
        {quizzes.length === 0 && <p className="empty-text">Aucun QCM disponible.</p>}
      </section>
    </div>
  );
}

export default CourseDetailPage;
