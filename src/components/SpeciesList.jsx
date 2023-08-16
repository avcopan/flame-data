import { Droppable, Draggable } from "react-beautiful-dnd";
import SpeciesItem from "./SpeciesItem";

export default function SpeciesList({ speciesList, className = "" }) {
  let speciesListWithInfo = [];
  let last_formula = "";

  for (const species of speciesList) {
    speciesListWithInfo.push([species, species.formula !== last_formula]);
    last_formula = species.formula;
  }

  return (
    <Droppable droppableId="main">
      {(provided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className={className}
        >
          <div
            className={`flex flex-wrap gap-8 justify-start items-end ${className}`}
          >
            {speciesListWithInfo.map(([species, firstInGroup], index) => (
              <SpeciesItem
                key={index}
                species={species}
                firstInGroup={firstInGroup}
              />
            ))}
          </div>
        </div>
      )}
    </Droppable>
  );
}
