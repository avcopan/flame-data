import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { textToggler } from "../utils/utils";
import BinarySelector from "../components/BinarySelector";
import PopupButton from "../components/PopupButton";
import SmilesEntryForm from "../components/SmilesEntryForm";
import StatusTable from "../components/StatusTable";
import SideCart from "../components/SideCart";
import actions from "../state/actions";

export default function FormPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const newSpecies = useSelector((store) => store.newSpecies);
  const [smiles1, setSmiles1] = useState("");
  const [smiles2, setSmiles2] = useState("");
  const [reactionMode, setReactionMode] = useState(false);

  const toggleText = textToggler(reactionMode, "reaction", "species");

  const addToCart = () => {
    dispatch(actions.addNewSpecies(smiles1));
  };

  const postNewSpecies = () => {
    dispatch(actions.postNewSpecies());
    setSmiles1("");
    navigate("/");
  };

  return (
    <div className="flex flex-col justify-center items-center">
      <BinarySelector
        text1="Species"
        text2="Reaction"
        vertical={false}
        selection={reactionMode}
        setSelection={setReactionMode}
        selectionFor={2}
        className="mb-12"
      />
      <h2 className="mb-12">
        Enter the {toggleText()} you want to add below...
      </h2>
      <div className="flex flex-row justify-center gap-24">
        <div className="flex flex-row gap-6">
          <SmilesEntryForm
            reactionMode={reactionMode}
            smiles1={smiles1}
            setSmiles1={setSmiles1}
            smiles2={smiles2}
            setSmiles2={setSmiles2}
          />
        </div>
        <StatusTable />
        <SideCart
          speciesHeader={`New ${toggleText("Reactions", "Species")}`}
          speciesList={newSpecies}
          buttonText="Post"
          buttonOnClick={postNewSpecies}
        />
      </div>
      <PopupButton
        condition={smiles1 && (smiles2 || !reactionMode)}
        text="Submit"
        onClick={addToCart}
      />
    </div>
  );
}
