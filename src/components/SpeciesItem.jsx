import { Link } from "react-router-dom";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import FormattedFormula from "./FormattedFormula";
import ViewSpeciesFromSVG from "./ViewSpeciesFromSVG";

export default function SpeciesItem({
  species,
  firstInGroup = false,
  className = "m-4 w-44",
  withCheckbox = false,
  checked = false,
  checkHandler = () => {},
  checkboxClassNames = "checkbox-primary checkbox-sm",
}) {
  return (
    <div>
      {firstInGroup && (
        <>
          <ChevronLeftIcon className="text-neutral rotate-45 h-6" />
          <div className="pl-6 text-neutral">
            <FormattedFormula formula={species.formula} />
          </div>
        </>
      )}
      <Link to={`/details/${species.id}`}>
        <ViewSpeciesFromSVG
          key={species.id}
          svgString={species.svg_string}
          className={className}
          hoverText={species.conn_smiles}
          withCheckbox={withCheckbox}
          checked={checked}
          checkHandler={checkHandler}
          checkboxClassNames={checkboxClassNames}
        />
      </Link>
    </div>
  );
}
