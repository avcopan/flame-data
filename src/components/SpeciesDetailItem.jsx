import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { prettyReactionSmiles } from "../utils/utils";
import actions from "../state/actions";
import ViewSpeciesFromXYZ from "./ViewSpeciesFromXYZ";

export default function DetailItem({ detailItem }) {
  const dispatch = useDispatch();
  const user = useSelector((store) => store.user);
  const reactionMode = useSelector((store) => store.reactionMode);
  const [editMode, setEditMode] = useState(false);
  const [geometry, setGeometry] = useState(detailItem.geometry);
  const editRef = useRef();

  useEffect(() => {
    setGeometry(editRef.current.innerText.replace("\n\n\n", "\n\n"));
  }, [editMode]);

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const restoreGeometry = () => {
    setGeometry(detailItem.geometry);
  };

  const submitUpdatedGeometry = () => {
    const id = detailItem.id;
    const connId = detailItem.conn_id;
    dispatch(actions.updateSpeciesGeometry({ id, connId, geometry }));
    window.location.reload();
  };

  return (
    <div className="mb-6 card flex flex-row flex-wrap gap-4 justify-center items-start bg-base-100 shadow-2xl">
      <ViewSpeciesFromXYZ
        id={`I${detailItem.id}`}
        className="m-4 w-96"
        xyzString={geometry}
      />
      <div className="items-center">
        <div className="stats stats-vertical shadow max-w-xl">
          <div className="stat">
            <div className="stat-title">SMILES</div>
            <div className="stat-value text-base overflow-x-auto">
              {prettyReactionSmiles(detailItem.smiles)}
            </div>
          </div>

          {!reactionMode && (
            <div className="stat">
              <div className="stat-title">InChI</div>
              <div className="stat-value text-base overflow-x-auto">
                {detailItem.inchi}
              </div>
            </div>
          )}

          <div className="stat">
            <div className="stat-title">AMChI</div>
            <div className="stat-value text-base overflow-x-auto">
              {detailItem.amchi}
            </div>
          </div>
        </div>
      </div>
      <div className="items-center">
        <div className="stats stats-vertical shadow">
          <div className="stat">
            <div className="flex flex-row justify-between">
              <div className="stat-title">Coordinates</div>
              <div className="flex gap-2">
                {detailItem.geometry != geometry && (
                  <>
                    <button
                      className="btn btn-outline btn-sm btn-primary"
                      onClick={restoreGeometry}
                    >
                      Restore
                    </button>
                    <button
                      className="btn btn-outline btn-sm btn-warning"
                      onClick={submitUpdatedGeometry}
                    >
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
