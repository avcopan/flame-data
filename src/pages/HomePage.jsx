import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import actions from "../state/actions";
import BinarySelector from "../components/BinarySelector";
import SpeciesList from "../components/SpeciesList";
import CollectionsMenu from "../components/CollectionsMenu";

export default function HomePage() {
  const dispatch = useDispatch();
  const user = useSelector((store) => store.user);
  const speciesList = useSelector((store) => store.species);
  const collections = useSelector((store) => store.collections);
  const [selectedSpecies, setSelectedSpecies] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
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

  const addSpeciesToCollection = () => {
    console.log("Species to add", selectedSpecies);
    console.log("Collection to add them to", selectedCollection);
    setSelectedSpecies([]);
  };

  return (
    <div className="flex flex-col gap-6 justify-center items-center">
      <div className="flex flex-row gap-6 mb-12">
        <div className="w-96 flex flex-col gap-6">
          <input
            type="text"
            spellCheck={false}
            placeholder="Search by formula..."
            className="input input-bordered w-full max-w-xl mr-2"
            value={searchFormula}
            onChange={(e) => setSearchFormula(e.target.value)}
          />
          <BinarySelector
            topText="Partial match"
            bottomText="Exact match"
            topSelected={searchPartial}
            setTopSelected={setSearchPartial}
          />
        </div>
        <button className="btn btn-outline" onClick={submitSearch}>
          Search
        </button>
      </div>
      <div className="flex flex-row justify-center gap-12 items-start">
        <SpeciesList
          speciesList={speciesList}
          className={user ? "w-2/3" : "w-full"}
          selectedSpecies={selectedSpecies}
          setSelectedSpecies={setSelectedSpecies}
        />
        {user && (
          <CollectionsMenu
            collections={collections}
            selectedCollection={selectedCollection}
            setSelectedCollection={setSelectedCollection}
          />
        )}
        {selectedSpecies.length > 0 && (
          <button
            onClick={addSpeciesToCollection}
            className="btn btn-primary m-1 fixed bottom-4 left-4"
          >
            Add to Collection
          </button>
        )}
      </div>
    </div>
  );
}
