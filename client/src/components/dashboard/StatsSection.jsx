import StatsCard from "./StatsCard";

function StatsSection() {
  return (
    <div className="stats-section">
      <StatsCard
        title="Cours suivis"
        value="6"
        subtitle="sur 8 disponibles"
      />

      <StatsCard
        title="Progression moy."
        value="68%"
        subtitle="+12% ce mois"
      />

      <StatsCard
        title="QCM réussis"
        value="4/6"
        subtitle="Seuil : 70%"
      />

      <StatsCard
        title="Prochaine leçon"
        value="Demain"
        subtitle="React Hooks – 09h00"
      />
    </div>
  );
}

export default StatsSection;