import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import actions from "../state/actions";
import SpeciesDetailItem from "../components/SpeciesDetailItem";

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
        <h1>Detail page</h1>
        <div>{connId}</div>
        {isomerList.map((isomer) => (
          <SpeciesDetailItem key={isomer.id} isomer={isomer} />
        ))}
      </div>
    )
  );
}
