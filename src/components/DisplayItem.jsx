import { Link } from "react-router-dom";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import FormattedFormula from "./FormattedFormula";
import ViewSpeciesFromSVG from "./ViewSpeciesFromSVG";
import ViewReactionFromSVG from "./ViewReactionFromSVG";

export default function DisplayItem({
  item,
  firstInGroup = false,
  reactionMode = false,
  withCheckbox = false,
  checked = false,
  checkHandler = () => {},
  className = "m-4 w-44",
  checkboxClassNames = "checkbox-primary checkbox-sm",
}) {
  return (
    <div>
      {firstInGroup && (
        <>
          <ChevronLeftIcon className="text-neutral rotate-45 h-6" />
          <div className="pl-6 text-neutral">
            <FormattedFormula formula={item.formula} />
          </div>
        </>
      )}
      {reactionMode ? (
        <ViewReactionFromSVG
          reactantSvgStrings={item.r_svg_strings}
          productSvgStrings={item.p_svg_strings}
          className={className}
          hoverText={item.conn_smiles}
          withCheckbox={withCheckbox}
          checked={checked}
          checkHandler={checkHandler}
          checkboxClassNames={checkboxClassNames}
        />
      ) : (
        <Link to={`/details/${item.id}`}>
          <ViewSpeciesFromSVG
            svgString={item.svg_string}
            className={className}
            hoverText={item.conn_smiles}
            withCheckbox={withCheckbox}
            checked={checked}
            checkHandler={checkHandler}
            checkboxClassNames={checkboxClassNames}
          />
        </Link>
      )}
    </div>
  );
}
