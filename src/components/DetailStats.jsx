export default function DetailStats({
  statsList,
  vertical = false,
  containerClassName = "shadow",
  valueClassName = "text-base",
}) {
  containerClassName += vertical ? " stats-vertical" : "";
  return (
    <div className={`stats ${containerClassName}`}>
      {statsList.map(([title, value, transform], index) => (
        <div key={index} className="stat">
          <div className="stat-title">{title}</div>
          <div className={`stat-value ${valueClassName}`}>
            {transform ? transform(value) : value}
          </div>
        </div>
      ))}
    </div>
  );
}
