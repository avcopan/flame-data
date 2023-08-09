import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import actions from "../state/actions";
import SpeciesDetailItem from "../components/SpeciesDetailItem";
import FormattedFormula from "../components/FormattedFormula";

export default function DetailPage() {
  const { connId } = useParams();
  const dispatch = useDispatch();
  const speciesDetails = useSelector((store) => store.speciesDetails);
  const isomerList = speciesDetails[connId];

  useEffect(() => {
    dispatch(actions.getSpeciesDetails(connId));
  }, []);

  console.log(isomerList);

  return (
    isomerList && (
      <div>
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Formula</div>
            <div className="stat-value">
              <FormattedFormula formula={isomerList[0].formula} />
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">SMILES</div>
            <div className="stat-value">
              {isomerList[0].conn_smiles}
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">Multiplicity</div>
            <div className="stat-value">
              {isomerList[0].spin_mult}
            </div>
          </div>
        </div>
        {isomerList.map((isomer) => (
          <SpeciesDetailItem key={isomer.id} isomer={isomer} />
        ))}
      </div>
    )
  );
}
