import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import actions from "../state/actions";

export default function HomePage() {
  const dispatch = useDispatch();
  const speciesList = useSelector((store) => store.species);

  useEffect(() => {
    dispatch(actions.getSpecies());
  }, []);

  console.log(speciesList);

  return (
    <div>
      <h2>Home</h2>
    </div>
  );
}
