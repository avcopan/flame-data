import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import actions from "../state/actions";
import BinarySelector from "../components/BinarySelector";
import SpeciesList from "../components/SpeciesList";
import SpeciesItem from "../components/SpeciesItem";

export default function HomePage() {
  const dispatch = useDispatch();
  const user = useSelector((store) => store.user);
  const speciesList = useSelector((store) => store.species);
  const collections = useSelector((store) => store.collections);
  const [searchFormula, setSearchFormula] = useState("");
  const [searchPartial, setSearchPartial] = useState(false);

  useEffect(() => {
    dispatch(actions.getSpecies());
    dispatch(actions.getCollections());
  }, []);

  const submitSearch = () => {
    const payload = { formula: searchFormula, partial: searchPartial };
    dispatch(actions.getSpecies(payload));
    setSearchFormula("");
  };

  return (
    <div className="flex flex-row gap-6 justify-between">
      <div className="w-fit flex flex-col">
        <div className="flex flex-row mb-8">
          <input
            type="text"
            spellCheck={false}
            placeholder="Search by formula..."
            className="input input-bordered w-full max-w-xl mr-2"
            value={searchFormula}
            onChange={(e) => setSearchFormula(e.target.value)}
          />
          <button className="btn btn-outline" onClick={submitSearch}>
            Search
          </button>
        </div>
        <div className="flex flex-row items-start mb-8">
          <BinarySelector
            topText="Partial match"
            bottomText="Exact match"
            topSelected={searchPartial}
            setTopSelected={setSearchPartial}
          />
        </div>
        <div className="flex flex-row justify-between">
          <SpeciesList speciesList={speciesList}
           className={user ? "w-3/4" : "w-full"}
            />
          {user && (
            <aside className="sticky top-12 join join-vertical w-1/4 h-screen-most pb-24">
              {collections.map((collection, index) => (
                <div
                  className="collapse join-item border border-primary"
                  key={collection.id}
                >
                  <input
                    type="radio"
                    name="my-accordion-2"
                    defaultChecked={index === 0}
                  />
                  <div className="collapse-title text-xl text-primary font-medium">
                    {collection.name}
                  </div>
                  <div className="collapse-content h-full flex flex-wrap justify-start overflow-auto">
                    {collection.species.map((species) => (
                      <SpeciesItem species={species} className="m-2 w-32" />
                    ))}
                  </div>
                </div>
              ))}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
