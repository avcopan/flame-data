import ViewFrame from "./ViewFrame";

export default function ViewSpeciesFromSVG({
  svgString,
  descriptors = [],
  className,
  hoverText = "",
}) {
  return (
    <ViewFrame className={className}>
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
    </ViewFrame>
  );
}
