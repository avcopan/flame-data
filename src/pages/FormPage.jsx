import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import DrawSpecies2DFromSmiles from "../components/DrawSpecies2DFromSmiles";
import SideCart from "../components/SideCart";
import actions from "../state/actions";

export default function FormPage() {
  const dispatch = useDispatch();
  const newSpecies = useSelector((store) => store.newSpecies);
  const [smiles, setSmiles] = useState("");

  const addToCart = () => {
    dispatch(actions.addNewSpecies(smiles));
  };

  const postNewSpecies = () => {
    dispatch(actions.postNewSpecies());
    setSmiles("");
  };

  return (
    <div className="flex flex-row justify-between">
      <div className="w-fit flex flex-col">
        <h2>Add a new species...</h2>
        <div className="flex flex-row">
          <input
            type="text"
            spellCheck={false}
            placeholder="Enter species SMILES..."
            className="input input-bordered w-full max-w-xl mr-2"
            value={smiles}
            onChange={(event) => setSmiles(event.target.value)}
          />
          <button className="btn btn-outline" onClick={addToCart}>
            Add
          </button>
        </div>
        <DrawSpecies2DFromSmiles className="m-4 w-96" smiles={smiles} />
      </div>
      <SideCart
        speciesHeader="New Species"
        speciesList={newSpecies}
        buttonText="Post"
        buttonOnClick={postNewSpecies}
      />
    </div>
  );
}
