export default function BinarySelector({
  topText,
  bottomText,
  topSelected,
  setTopSelected,
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-4">
        <input
          type="radio"
          className="radio"
          checked={topSelected}
          onChange={() => setTopSelected(!topSelected)}
        />
        <div className={topSelected ? "" : "text-neutral"}>{topText}</div>
      </div>
      <div className="flex flex-row gap-4">
        <input
          type="radio"
          className="radio"
          checked={!topSelected}
          onChange={() => setTopSelected(!topSelected)}
        />
        <div className={topSelected ? "text-neutral" : ""}>{bottomText}</div>
      </div>
    </div>
  );
}
