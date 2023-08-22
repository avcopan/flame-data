export default function DetailStats({
  statsObject,
  statsList,
  vertical = false,
  containerClassName = "shadow",
  valueClassName = "",
}) {
  containerClassName += vertical ? " stats-vertical" : "";
  return (
    <div className={`stats ${containerClassName}`}>
      {statsList.map(([title, key, transform], index) => (
        <div key={index} className="stat">
          <div className="stat-title">{title}</div>
          <div className={`stat-value ${valueClassName}`}>
            {transform ? transform(statsObject[key]) : statsObject[key]}
          </div>
        </div>
      ))}
    </div>
  );
}
