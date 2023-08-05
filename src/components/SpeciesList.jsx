import { useSelector } from "react-redux";
import { groupby } from "itertools";
import ViewSpecies2D from "../components/ViewSpecies2D";

export default function SpeciesList() {
  const speciesList = useSelector((store) => store.species);
  return (
    <div className="flex flex-wrap gap-8 justify-start items-end">
      {speciesList.map((species, index) => (
        <div className={index ? "" : "border-t border-l"}>
          <div className="pt-4 pl-4">{index ? "" : species.formula}</div>
          <ViewSpecies2D
            key={species.conn_id}
            svgString={species.svg_string}
            descriptors={[species.formula]}
            className="m-4 w-48"
          />
        </div>
      ))}
    </div>
  );
}
