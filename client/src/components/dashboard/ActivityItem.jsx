function ActivityItem({ icon, title, time, status }) {
  return (
    <div className="activity-item">
      <div className="activity-icon">{icon}</div>

      <div className="activity-content">
        <h4>{title}</h4>
        <p>{time}</p>
      </div>

      <span className={`status ${status.toLowerCase()}`}>
        {status}
      </span>
    </div>
  );
}

export default ActivityItem;