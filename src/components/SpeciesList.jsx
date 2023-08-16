import SpeciesItem from "./SpeciesItem";

export default function SpeciesList({ speciesList, className = "" }) {
  let speciesListWithInfo = [];
  let last_formula = "";

  for (const species of speciesList) {
    speciesListWithInfo.push([species, species.formula !== last_formula]);
    last_formula = species.formula;
  }

  return (
    <div
      className={`flex flex-wrap gap-8 justify-start items-end ${className}`}
    >
      {speciesListWithInfo.map(([species, firstInGroup], index) => (
        <SpeciesItem species={species} firstInGroup={firstInGroup} key={index} />
      ))}
    </div>
  );
}
