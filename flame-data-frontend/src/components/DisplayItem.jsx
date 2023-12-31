import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { formatFormula } from "../utils/utils";
import ViewSpeciesFromSVG from "./ViewSpeciesFromSVG";
import ViewReactionFromSVG from "./ViewReactionFromSVG";

export default function DisplayItem({
  item,
  firstInGroup = false,
  withCheckbox = false,
  checked = false,
  checkHandler = () => {},
  className = "m-4 w-44",
  checkboxClassNames = "checkbox-primary checkbox-sm",
}) {
  const reactionMode = useSelector((store) => store.reactionMode);

  return (
    <div>
      {firstInGroup && (
        <>
          <ChevronLeftIcon className="text-neutral rotate-45 h-6" />
          <div className="pl-6 text-neutral">{formatFormula(item.formula)}</div>
        </>
      )}
      {reactionMode ? (
        <Link to={`/reaction/details/${item.id}`}>
          <ViewReactionFromSVG
            reactantsSvgString={item.r_svg_string}
            productsSvgString={item.p_svg_string}
            className={className}
            hoverText={item.conn_smiles}
            withCheckbox={withCheckbox}
            checked={checked}
            checkHandler={checkHandler}
            checkboxClassNames={checkboxClassNames}
          />
        </Link>
      ) : (
        <Link to={`/species/details/${item.id}`}>
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
