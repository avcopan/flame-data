import ViewFrame from "./ViewFrame";

export default function ViewReactionFromSVG({
  reactantSvgStrings,
  productSvgStrings,
  descriptors = [],
  hoverText = "",
  withCheckbox = false,
  checked = false,
  checkHandler = () => {},
  className = "h-96",
  checkboxClassNames = "checkbox-primary checkbox-sm",
}) {
  console.log(reactantSvgStrings[0]);

  return (
    <ViewFrame
      withCheckbox={withCheckbox}
      checked={checked}
      checkHandler={checkHandler}
      checkboxClassNames={checkboxClassNames}
      className={className}
    >
      {reactantSvgStrings && (
        <>
          <div className="h-3/4 flex flex-row">
            {reactantSvgStrings.map((svgString, index) => (
              <img
                src={`data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`}
                key={index}
                className="w-1/2 rounded-3xl"
              />
            ))}
          </div>
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
