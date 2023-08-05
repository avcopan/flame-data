import { useSelector } from "react-redux";
import { groupby } from "itertools";
import SpeciesGroup from "./SpeciesGroup";

export default function SpeciesList() {
  const speciesList = useSelector((store) => store.species);
  let speciesGroups = [];
  for (const [f, g] of groupby(speciesList, (s) => s.formula)) {
    speciesGroups.push([...g]);
  }
  return (
    <div className="flex flex-wrap gap-8 justify-start items-end">
      {speciesGroups.map((speciesGroup, i) => (
        <SpeciesGroup key={i} speciesGroup={speciesGroup} />
      ))}
    </div>
  );
}
