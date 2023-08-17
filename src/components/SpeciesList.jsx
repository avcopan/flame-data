import SpeciesItem from "./SpeciesItem";

export default function SpeciesList({ speciesList, className = "", selectedSpecies, setSelectedSpecies }) {

  let speciesListWithGroupIndicator = [];
  let last_formula = "";

  for (const species of speciesList) {
    speciesListWithGroupIndicator.push([
      species,
      species.formula !== last_formula,
    ]);
    last_formula = species.formula;
  }

  const checkHandler = (connId) => {
    return (event) => {
      event.stopPropagation();
      if (selectedSpecies.includes(connId)) {
        setSelectedSpecies(selectedSpecies.filter((i) => i !== connId));
      } else {
        setSelectedSpecies([...selectedSpecies, connId]);
      }
    };
  };

  return (
    <div
      className={`flex flex-wrap gap-8 justify-start items-end pb-24 ${className}`}
    >
      {speciesListWithGroupIndicator.map(([species, firstInGroup], index) => (
        <SpeciesItem
          species={species}
          firstInGroup={firstInGroup}
          key={index}
          withCheckbox={true}
          checked={selectedSpecies.includes(species.id)}
          checkHandler={checkHandler(species.id)}
        />
      ))}
    </div>
  );
}
