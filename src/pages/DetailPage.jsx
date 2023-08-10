import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import actions from "../state/actions";
import SpeciesDetailItem from "../components/SpeciesDetailItem";
import FormattedFormula from "../components/FormattedFormula";
import { TrashIcon } from "@heroicons/react/24/outline";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

export default function DetailPage() {
  const { connId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const speciesDetails = useSelector((store) => store.speciesDetails);
  const isomerList = speciesDetails[connId];

  useEffect(() => {
    dispatch(actions.getSpeciesDetails(connId));
  }, []);

  const deleteThisSpecies = () => {
    dispatch(actions.deleteSpecies(connId));
    navigate("/");
  };

  return (
    isomerList && (
      <div className="max-w-screen-xl">
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
            <div className="stat-title">Multiplicity</div>
            <div className="stat-value">{isomerList[0].spin_mult}</div>
          </div>
        </div>
        <div className="mb-8 flex flex-col">
          {isomerList.map((isomer) => (
            <SpeciesDetailItem key={isomer.id} isomer={isomer} />
          ))}
        </div>
        {/* Open the modal using ID.showModal() method */}
        <button
          className="btn btn-error btn-outline btn-square"
          onClick={() => window.deletion_dialog.showModal()}
        >
          <TrashIcon className="p-1" />
        </button>
        <dialog id="deletion_dialog" className="modal">
          <form method="dialog" className="modal-box">
            <ExclamationCircleIcon className="mb-4 h-8 w-8 text-error" />
            <h3 className="text-lg">
              Are you sure? This will delete all records for species {connId}.
            </h3>
            <div className="modal-action">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn">No</button>
              <button className="btn btn-error" onClick={deleteThisSpecies}>
                Yes
              </button>
            </div>
          </form>
        </dialog>
      </div>
    )
  );
}
