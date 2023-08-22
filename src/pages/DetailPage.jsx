import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import actions from "../state/actions";
import { prettyReactionSmiles } from "../utils/utils";
import DetailItem from "../components/SpeciesDetailItem";
import FormattedFormula from "../components/FormattedFormula";
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
        <div className="mb-8 stats shadow">
          <div className="stat">
            <div className="stat-title">Formula</div>
            <div className="stat-value">
              <FormattedFormula formula={detailItems[0].formula} />
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">SMILES</div>
            <div className="stat-value">
              {prettyReactionSmiles(detailItems[0].conn_smiles)}
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">Spin Multiplicity</div>
            <div className="stat-value">{detailItems[0].spin_mult}</div>
          </div>
        </div>
        <div className="mb-8 flex flex-col">
          {detailItems.map((detailItem, index) => (
            <DetailItem key={index} detailItem={detailItem} />
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
