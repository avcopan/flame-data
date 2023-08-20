import { useState } from "react";
import { useDispatch } from "react-redux";
import { textToggler } from "../utils/utils";
import BinarySelector from "../components/BinarySelector";
import PopupButton from "../components/PopupButton";
import SmilesEntryForm from "../components/SmilesEntryForm";
import SubmissionStatusTable from "../components/SubmissionStatusTable";
import actions from "../state/actions";

export default function FormPage() {
  const dispatch = useDispatch();
  const [smiles1, setSmiles1] = useState("");
  const [smiles2, setSmiles2] = useState("");
  const [reactionMode, setReactionMode] = useState(false);

  const toggleText = textToggler(reactionMode, "reaction", "species");

  const submit = () => {
    let smiles;
    if (reactionMode) {
      smiles = smiles1 + " >> " + smiles2;
    } else {
      smiles = smiles1;
    }
    dispatch(actions.postSubmission({ smiles, isReaction: reactionMode }));
    setSmiles1("");
    setSmiles2("");
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
        <SubmissionStatusTable />
      </div>
      <PopupButton
        condition={smiles1 && (smiles2 || !reactionMode)}
        text="Submit"
        onClick={submit}
      />
    </div>
  );
}
