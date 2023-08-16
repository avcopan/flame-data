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
          className={className}
          {...provided.droppableProps}
          ref={provided.innerRef}
        >
          <div
            className={`flex flex-wrap gap-8 justify-start items-end ${className}`}
          >
            {speciesListWithInfo.map(([species, firstInGroup], index) => (
              <Draggable
                key={index}
                draggableId={String(species.conn_id)}
                index={index}
              >
                {(provided) => (
                  <div
                    {...provided.dragHandleProps}
                    {...provided.draggableProps}
                    ref={provided.innerRef}
                  >
                    <SpeciesItem
                      species={species}
                      firstInGroup={firstInGroup}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
}
