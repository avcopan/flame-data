import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import actions from "../state/actions";
import SpeciesDetailItem from "../components/SpeciesDetailItem";
import FormattedFormula from "../components/FormattedFormula";
import DeleteButton from "../components/DeleteButton";

export default function DetailPage() {
  const { connId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((store) => store.user);
  const speciesDetails = useSelector((store) => store.speciesDetails);
  const isomerList = speciesDetails[connId];

  useEffect(() => {
    dispatch(actions.getSpeciesDetails(connId));
  }, []);

  const deleteSpecies = () => {
    dispatch(actions.deleteSpecies(connId));
    navigate("/");
  };

  return (
    isomerList && (
      <div className="max-w-screen-2xl flex flex-col">
        <div className="mb-8 stats shadow">
          <div className="stat">
            <div className="stat-title">Formula</div>
            <div className="stat-value">
              <FormattedFormula formula={isomerList[0].formula} />
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">SMILES</div>
            <div className="stat-value">{isomerList[0].conn_smiles}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Spin Multiplicity</div>
            <div className="stat-value">{isomerList[0].spin_mult}</div>
          </div>
        </div>
        <div className="mb-8 flex flex-col">
          {isomerList.map((isomer) => (
            <SpeciesDetailItem key={isomer.id} isomer={isomer} />
          ))}
        </div>
        {/* Open the modal using ID.showModal() method */}
        {user && (
          <DeleteButton
            warningMessage={`Are you sure? This will delete all records for species ${connId}`}
            handleDelete={deleteSpecies}
          />
        )}
      </div>
    )
  );
}
