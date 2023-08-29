import { useDispatch, useSelector } from "react-redux";
import actions from "../state/actions";
import BinarySelector from "./BinarySelector";

export default function ReactionModeSelector() {
  const dispatch = useDispatch();
  const reactionMode = useSelector((store) => store.reactionMode);

  const setReactionMode = (mode) => {
    dispatch(actions.setReactionMode(mode));
  };
  return (
    <BinarySelector
      text1="Species"
      text2="Reaction"
      vertical={false}
      selection={reactionMode}
      setSelection={setReactionMode}
      selectionFor={2}
      className="mb-12"
    />
  );
}
