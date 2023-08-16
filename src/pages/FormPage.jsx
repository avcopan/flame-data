import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import ViewSpeciesFromSmiles from "../components/ViewSpeciesFromSmiles";
import SideCart from "../components/SideCart";
import actions from "../state/actions";

export default function FormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const newSpecies = useSelector((store) => store.newSpecies);
  const [smiles, setSmiles] = useState("");

  const addToCart = () => {
    dispatch(actions.addNewSpecies(smiles));
  };

  const postNewSpecies = () => {
    dispatch(actions.postSpecies());
    setSmiles("");
    navigate("/");
  };

  return (
    <div className="flex flex-row justify-center gap-24">
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
        <ViewSpeciesFromSmiles className="m-4 w-96 h-96" smiles={smiles} />
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
