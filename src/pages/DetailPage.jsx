import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  formatFormula,
  prettyReactionSmiles,
  capitalizeText,
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
  const itemDetails = useSelector((store) =>
    reactionMode ? store.reactionDetails : store.speciesDetails
  );
  const detailItems = itemDetails[id];
  const headlineStatsList = [];
  if (detailItems) {
    headlineStatsList.push(
      ["Formula", detailItems[0].formula, formatFormula],
      ["SMILES", detailItems[0].conn_smiles, prettyReactionSmiles],
      ["Spin Multiplicity", detailItems[0].spin_mult]
    );
  }
  if (detailItems && reactionMode) {
    headlineStatsList.splice(1, 0, [
      "Reaction Class",
      "class",
      capitalizeText,
    ]);
  }

  useEffect(() => {
    if (reactionMode !== isReaction) {
      dispatch(actions.setReactionMode(isReaction));
    }
  }, []);

  useEffect(() => {
    dispatch(actions.getDetails(id));
  }, []);

  const deleteSpecies = () => {
    dispatch(actions.deleteSpecies(id));
    navigate("/");
  };

  return (
    detailItems && (
      <div className="max-w-screen-2xl flex flex-col">
        <DetailStats
          statsObject={detailItems[0]}
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
            warningMessage={`Are you sure? This will delete all records for species ${id}`}
            handleDelete={deleteSpecies}
          />
        )}
      </div>
    )
  );
}
