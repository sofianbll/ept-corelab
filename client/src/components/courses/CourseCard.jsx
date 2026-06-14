function CourseCard({ icon, title, lessons, duration }) {
  return (
    <div className="course-card">
      <div className="course-icon">
        <span>{icon}</span>
      </div>

      <h3>{title}</h3>

      <p>
        {lessons} leçons · {duration}
      </p>

      <button>Continuer</button>
    </div>
  );
}

export default CourseCard;