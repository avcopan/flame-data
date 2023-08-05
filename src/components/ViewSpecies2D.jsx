export default function ViewSpecies2D({
  svgString,
  descriptors = [],
  className,
  hoverText = "",
}) {
  return (
    <div
      className={`bg-white aspect-square flex flex-col justify-center items-center rounded-3xl ${className}`}
    >
      {svgString && (
        <>
          <img
            className="h-3/4 rounded-3xl"
            src={`data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`}
            title={hoverText}
          />
          {descriptors.map((descriptor, idx) => (
            <div key={idx} className="text-neutral text-lg">
              {descriptor}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
