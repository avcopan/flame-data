import { useState } from "react";

export default function FormPage() {
  const [smiles, setSmiles] = useState("");

  return (
    <div>
      <h2>Add a new species...</h2>
      <input
        type="text"
        placeholder="Enter species SMILES..."
        className="input input-bordered w-full max-w-sm mr-2"
        value={smiles}
        onChange={(event) => setSmiles(event.target.value)}
      />
      <button className="btn btn-outline">View</button>
      <p>{smiles}</p>
    </div>
  );
}
