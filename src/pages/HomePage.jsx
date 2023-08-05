import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import actions from "../state/actions";
import ViewSpecies2D from "../components/ViewSpecies2D";
import BinarySelector from "../components/BinarySelector";

export default function HomePage() {
  const dispatch = useDispatch();
  const speciesList = useSelector((store) => store.species);
  const [formulaInput, setFormulaInput] = useState("");
  const [partialSelected, setPartialSelected] = useState(false);

  useEffect(() => {
    dispatch(actions.getSpecies());
  }, []);

  console.log(speciesList);

  return (
    <div>
      <div className="flex flex-row mb-8">
        <input
          type="text"
          spellCheck={false}
          placeholder="Search by formula..."
          className="input input-bordered w-full max-w-xl mr-2"
        />
        <button className="btn btn-outline">Search</button>
      </div>
      <div className="flex flex-row items-start mb-8">
        <BinarySelector
          topText="Partial match"
          bottomText="Exact match"
          topSelected={partialSelected}
          setTopSelected={setPartialSelected}
        />
      </div>
      <div className="flex flex-wrap gap-8 justify-start items-start">
        {speciesList.map((species) => (
          <ViewSpecies2D
            svgString={species.svg_string}
            descriptors={[species.formula]}
            className="m-4 w-48"
          />
        ))}
      </div>
    </div>
  );
}
