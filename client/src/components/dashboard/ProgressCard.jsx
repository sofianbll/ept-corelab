function ProgressCard({ course, progress }) {
  return (
    <div className="progress-card">
      <div className="progress-header">
        <h3>{course}</h3>
        <span>{progress}%</span>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}

export default ProgressCard;