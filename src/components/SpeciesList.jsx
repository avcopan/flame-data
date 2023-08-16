import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import SpeciesItem from "./SpeciesItem";

export default function SpeciesList({ speciesList, className = "" }) {
  const [selected, setSelected] = useState([]);
  const collections = useSelector((store) => store.collections);

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

  const addSelectedToCollection = (collection) => {
    return () => {
      console.log("Adding to collection:", collection.name);
      console.log("Collection ID:", collection.id);
      setSelected([]);
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
          checked={selected.includes(species.conn_id)}
          checkHandler={checkHandler(species.conn_id)}
        />
      ))}
      {selected.length > 0 &&
        (collections.length > 1 ? (
          <div className="dropdown dropdown-top dropdown-hover fixed bottom-4 left-4">
            <label tabIndex={0} className="btn btn-primary m-1">
              Add to Collection
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              {collections.map((collection, index) => (
                <li onClick={addSelectedToCollection(collection)} key={index}>
                  <a>{collection.name}</a>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <button
            onClick={addSelectedToCollection(collections[0])}
            className="btn btn-primary m-1 fixed bottom-4 left-4"
          >
            Add to Collection
          </button>
        ))}
    </div>
  );
}
