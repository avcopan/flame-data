import { useState } from "react";
import Molecule2DView from "../components/Molecule2DView";

export default function FormPage() {
  const [smiles, setSmiles] = useState("");

  return (
    <div className="w-fit flex flex-col">
      <h2>Add a new species...</h2>
      <div className="flex flex-row">
        <input
          type="text"
          spellCheck={false}
          placeholder="Enter species SMILES..."
          className="input input-bordered w-full max-w-xl mr-2"
          value={smiles}
          onChange={(event) => setSmiles(event.target.value)}
        />
        <button className="btn btn-outline">Add</button>
      </div>
      <Molecule2DView className="m-4 w-96" smiles={smiles} />
    </div>
  );
}
