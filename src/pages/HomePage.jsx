import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import actions from "../state/actions";
import ViewSpecies2D from "../components/ViewSpecies2D";

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
      {speciesList.map((species) => (
        <ViewSpecies2D
          svgString={species.svg_string}
          descriptors={[species.formula]}
          className="m-4 w-48"
        />
      ))}
    </div>
  );
}
