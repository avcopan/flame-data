import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import actions from "../state/actions";
import BinarySelector from "../components/BinarySelector";
import SpeciesList from "../components/SpeciesList";

export default function HomePage() {
  const dispatch = useDispatch();
  const [searchFormula, setSearchFormula] = useState("");
  const [searchPartial, setSearchPartial] = useState(false);

  useEffect(() => {
    dispatch(actions.getSpecies());
  }, []);

  const submitSearch = () => {
    const payload = { formula: searchFormula, partial: searchPartial };
    dispatch(actions.getSpecies(payload));
    setSearchFormula("");
  };

  return (
    <div>
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
      <SpeciesList />
    </div>
  );
}
