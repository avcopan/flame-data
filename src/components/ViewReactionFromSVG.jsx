import ViewFrame from "./ViewFrame";
import { ArrowLongDownIcon } from "@heroicons/react/24/outline";

export default function ViewReactionFromSVG({
  reactantsSvgString,
  productsSvgString,
  descriptors = [],
  hoverText = "",
  withCheckbox = false,
  checked = false,
  checkHandler = () => {},
  className = "h-96",
  checkboxClassNames = "checkbox-primary checkbox-sm",
}) {
  const containerClassName = descriptors.length ? "h-3/4" : "h-full";
  return (
    <ViewFrame
      withCheckbox={withCheckbox}
      checked={checked}
      checkHandler={checkHandler}
      checkboxClassNames={checkboxClassNames}
      className={className}
    >
      {reactantsSvgString && (
        <>
          <div
            className={`relative w-full flex flex-col justify-between items-center ${containerClassName}`}
          >
            <img
              src={`data:image/svg+xml;utf8,${encodeURIComponent(
                reactantsSvgString
              )}`}
              className="p-2 h-1/2 max-w-full rounded-3xl"
            />
            <img
              src={`data:image/svg+xml;utf8,${encodeURIComponent(
                productsSvgString
              )}`}
              className="p-2 h-1/2 max-w-full rounded-3xl"
            />
            <div className="w-full h-full absolute inset-0 top-1/2 left-1/2">
              <ArrowLongDownIcon className="text-black h-10 -translate-y-1/2 -translate-x-1/2" />
            </div>
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
