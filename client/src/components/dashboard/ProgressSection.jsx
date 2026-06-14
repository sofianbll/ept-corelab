import ProgressCard from "./ProgressCard";

function ProgressSection() {
  return (
    <div className="progress-section">
      <h2>Progression des cours</h2>

      <ProgressCard course="Node.js — API REST" progress={90} />

      <ProgressCard course="React — Fondamentaux" progress={72} />

      <ProgressCard course="MongoDB — Modélisation" progress={55} />

      <ProgressCard course="Express.js — Middleware" progress={30} />
    </div>
  );
}

export default ProgressSection;