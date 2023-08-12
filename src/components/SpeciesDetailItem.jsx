import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import ViewSpeciesFromXYZ from "./ViewSpeciesFromXYZ";

export default function SpeciesDetailItem({ isomer }) {
  const [editMode, setEditMode] = useState(false);
  const [geometry, setGeometry] = useState(isomer.geometry);
  const editRef = useRef();
  const user = useSelector((store) => store.user);

  useEffect(() => {
    setGeometry(editRef.current.innerText.replace("\n\n\n", "\n\n"));
  }, [editMode]);

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const restoreGeometry = () => {
    setGeometry(isomer.geometry);
  };

  return (
    <div className="mb-6 card flex flex-row flex-wrap gap-4 justify-center items-start bg-base-100 shadow-xl">
      <figure className="">
        <ViewSpeciesFromXYZ
          id={`I${isomer.id}`}
          className="m-4 w-96"
          xyzString={geometry}
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
                {isomer.geometry != geometry && (
                  <>
                    <button
                      className="btn btn-outline btn-sm btn-primary"
                      onClick={restoreGeometry}
                    >
                      Restore
                    </button>
                    <button className="btn btn-outline btn-sm btn-warning">
                      Submit
                    </button>
                  </>
                )}
                {user && (
                  <button
                    className="btn btn-outline btn-sm btn-secondary"
                    onClick={toggleEditMode}
                  >
                    {editMode ? "Done" : "Edit"}
                  </button>
                )}
              </div>
            </div>
            <div
              ref={editRef}
              className={`w-96 max-h-96 m-2 rounded-lg overflow-auto text-base whitespace-pre-wrap font-mono ${
                editMode
                  ? "outline outline-1 outline-secondary focus:outline-4"
                  : ""
              }`}
              contentEditable={editMode}
              suppressContentEditableWarning
            >
              {geometry}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
