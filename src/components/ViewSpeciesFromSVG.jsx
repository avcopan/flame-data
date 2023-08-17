import ViewFrame from "./ViewFrame";

export default function ViewSpeciesFromSVG({
  svgString,
  descriptors = [],
  className,
  hoverText = "",
  withCheckbox = false,
  checked = false,
  checkHandler = () => {},
  checkboxClassNames = "checkbox-primary checkbox-sm",
}) {
  return (
    <ViewFrame
      className={className}
      withCheckbox={withCheckbox}
      checked={checked}
      checkHandler={checkHandler}
      checkboxClassNames={checkboxClassNames}
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
