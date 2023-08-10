import { useState } from "react";
import ViewSpeciesFromXYZ from "./ViewSpeciesFromXYZ";

export default function SpeciesDetailItem({ isomer }) {
  const [editMode, setEditMode] = useState(false);
  const [isomerGeometry, setIsomerGeometry] = useState(isomer.geometry);

  return (
    <div className="mb-6 card flex flex-row flex-wrap gap-4 justify-center items-start bg-base-100 shadow-xl">
      <figure className="">
        <ViewSpeciesFromXYZ
          id={`I${isomer.id}`}
          className="m-4 w-96"
          xyzString={isomerGeometry}
        />
      </figure>
      <div className="items-center">
        <div className="stats stats-vertical shadow">
          <div className="stat">
            <div className="stat-title">SMILES</div>
            <div className="stat-value text-base">{isomer.smiles}</div>
          </div>

          <div className="stat">
            <div className="stat-title">InChI</div>
            <div className="stat-value text-base">{isomer.inchi}</div>
          </div>

          <div className="stat">
            <div className="stat-title">AMChI</div>
            <div className="stat-value text-base">{isomer.amchi}</div>
          </div>
        </div>
      </div>
      <div className="items-center">
        <div className="stats stats-vertical shadow">
          <div className="stat">
            <div className="flex flex-row justify-between">
              <div className="stat-title">Coordinates</div>
              <div className="flex gap-2">
                {isomer.geometry != isomerGeometry && (
                  <>
                    <button className="btn btn-outline btn-sm btn-primary">
                      View
                    </button>
                    <button className="btn btn-outline btn-sm btn-warning">
                      Submit
                    </button>
                  </>
                )}
                <button
                  className="btn btn-outline btn-sm btn-secondary"
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? "Done" : "Edit"}
                </button>
              </div>
            </div>
            <div
              className={`w-96 max-h-72 m-2 rounded-lg overflow-auto text-base whitespace-pre-wrap font-mono ${
                editMode
                  ? "outline outline-1 outline-secondary focus:outline-4"
                  : ""
              }`}
              contentEditable={editMode}
            >
              {isomerGeometry}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
