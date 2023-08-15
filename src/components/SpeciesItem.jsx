import { Link } from "react-router-dom";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import FormattedFormula from "./FormattedFormula";
import ViewSpeciesFromSVG from "./ViewSpeciesFromSVG";

export default function SpeciesItem({ species, firstInGroup = false, className="m-4 w-44" }) {
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
      <Link to={`/details/${species.conn_id}`}>
        <ViewSpeciesFromSVG
          key={species.conn_id}
          svgString={species.svg_string}
          className={className}
          hoverText={species.conn_smiles}
        />
      </Link>
    </div>
  );
}
