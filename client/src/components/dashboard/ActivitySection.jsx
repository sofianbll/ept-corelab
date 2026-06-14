import ActivityItem from "./ActivityItem";

function ActivitySection() {
  return (
    <div className="activity-section">
      <h2>Activité récente</h2>

      <ActivityItem
        icon="📖"
        title="Leçon terminée — Express.js Routes avancées"
        time="Il y a 2h"
        status="Terminé"
      />

      <ActivityItem
        icon="📝"
        title="QCM tenté — MongoDB Bases · Score : 65%"
        time="Hier"
        status="Raté"
      />

      <ActivityItem
        icon="✅"
        title="QCM réussi — Node.js Fondamentaux · Score : 88%"
        time="Il y a 3 jours"
        status="Réussi"
      />
    </div>
  );
}

export default ActivitySection;