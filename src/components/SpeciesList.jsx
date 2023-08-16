import { useEffect, useState } from "react";
import SpeciesItem from "./SpeciesItem";

export default function SpeciesList({ speciesList, className = "" }) {
  const [selected, setSelected] = useState([]);

  let speciesListWithGroupIndicator = [];
  let last_formula = "";

  for (const species of speciesList) {
    speciesListWithGroupIndicator.push([
      species,
      species.formula !== last_formula,
    ]);
    last_formula = species.formula;
  }

  useEffect(() => {
    setSelected([]);
  }, []);

  const checkHandler = (connId) => {
    return (event) => {
      event.stopPropagation();
      if (selected.includes(connId)) {
        setSelected(selected.filter((i) => i !== connId));
      } else {
        setSelected([...selected, connId]);
      }
    };
  };

  return (
    <div
      className={`flex flex-wrap gap-8 justify-start items-end ${className}`}
    >
      {speciesListWithGroupIndicator.map(([species, firstInGroup], index) => (
        <SpeciesItem
          species={species}
          firstInGroup={firstInGroup}
          key={index}
          withCheckbox={true}
          checked={selected.includes(species.conn_id)}
          checkHandler={checkHandler(species.conn_id)}
        />
      ))}
    </div>
  );
}
