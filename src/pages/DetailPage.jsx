import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  formatFormula,
  prettyReactionSmiles,
  textToggler,
} from "../utils/utils";
import actions from "../state/actions";
import DetailItem from "../components/DetailItem";
import DetailStats from "../components/DetailStats";
import DeleteButton from "../components/DeleteButton";

export default function DetailPage({ isReaction }) {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((store) => store.user);
  const reactionMode = useSelector((store) => store.reactionMode);
  const details = useSelector((store) =>
    reactionMode ? store.reactionDetails : store.speciesDetails
  );

  const toggleText = textToggler(reactionMode, "reaction", "species");

  const detailItems = details[id];
  const headlineStatsList = [];
  if (detailItems) {
    headlineStatsList.push(
      ["Formula", detailItems[0].formula, formatFormula],
      ["SMILES", detailItems[0].conn_smiles, prettyReactionSmiles],
      ["Spin Multiplicity", detailItems[0].spin_mult]
    );
  }

  useEffect(() => {
    if (reactionMode !== isReaction) {
      dispatch(actions.setReactionMode(isReaction));
    }
  }, []);

  useEffect(() => {
    dispatch(actions.getDetails(id));
  }, []);

  const deleteItem = () => {
    dispatch(actions.deleteItem(id));
    navigate("/");
  };

  return (
    detailItems && (
      <div className="flex flex-col">
        <DetailStats
          statsList={headlineStatsList}
          containerClassName="mb-8 shadow-2xl"
          valueClassName="text-3xl"
        />
        <div className="mb-8 flex flex-col">
          {detailItems.map((detailItem, index) => (
            <DetailItem
              key={index}
              detailItem={detailItem}
              isomerIndex={index}
              isomerCount={detailItems.length}
            />
          ))}
        </div>
        {/* Open the modal using ID.showModal() method */}
        {user && (
          <DeleteButton
            warningMessage={`Are you sure? This will delete all records for ${toggleText()} ${id}`}
            handleDelete={deleteItem}
          />
        )}
      </div>
    )
  );
}
