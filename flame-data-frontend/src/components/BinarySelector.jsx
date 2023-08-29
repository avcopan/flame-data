export default function BinarySelector({
  text1,
  text2,
  selection,
  setSelection,
  vertical = true,
  selectionFor = 1,
  className = "",
}) {
  const getSelection = () => {
    return selectionFor === 1 ? selection : !selection;
  };

  className = `${
    vertical ? "flex flex-col gap-2" : "flex flex-row gap-12"
  } ${className}`;

  return (
    <div className={className}>
      <div className="flex flex-row gap-4">
        <input
          type="radio"
          className="radio"
          checked={getSelection()}
          onChange={() => setSelection(!selection)}
        />
        <div className={getSelection() ? "" : "text-neutral"}>{text1}</div>
      </div>
      <div className="flex flex-row gap-4">
        <input
          type="radio"
          className="radio"
          checked={!getSelection()}
          onChange={() => setSelection(!selection)}
        />
        <div className={getSelection() ? "text-neutral" : ""}>{text2}</div>
      </div>
    </div>
  );
}
