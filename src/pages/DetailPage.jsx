import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import actions from "../state/actions";

export default function DetailPage() {
  const { connId } = useParams();
  const dispatch = useDispatch();
  const speciesDetails = useSelector((store) => store.speciesDetails);

  useEffect(() => {
    dispatch(actions.getSpeciesDetails(connId));
  }, []);

  console.log(speciesDetails);

  return (
    speciesDetails[connId] && (
      <div>
        <h1>Detail page</h1>
        <div>{connId}</div>
        <div>{JSON.stringify(speciesDetails[connId])}</div>
      </div>
    )
  );
}
