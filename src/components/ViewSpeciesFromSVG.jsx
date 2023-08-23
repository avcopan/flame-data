import ViewFrame from "./ViewFrame";

export default function ViewSpeciesFromSVG({
  svgString,
  descriptors = [],
  hoverText = "",
  withCheckbox = false,
  checked = false,
  checkHandler = () => {},
  className = "h-96",
  checkboxClassNames = "checkbox-primary checkbox-sm",
}) {
  return (
    <ViewFrame
      withCheckbox={withCheckbox}
      checked={checked}
      checkHandler={checkHandler}
      checkboxClassNames={checkboxClassNames}
      className={className}
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
    </ViewFrame>
  );
}
