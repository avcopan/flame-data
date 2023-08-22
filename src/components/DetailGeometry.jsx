import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import actions from "../state/actions";
import ViewSpeciesFromXYZ from "./ViewSpeciesFromXYZ";

export default function DetailGeometry({ geometry, connId, id }) {
  const dispatch = useDispatch();
  const user = useSelector((store) => store.user);
  const [editMode, setEditMode] = useState(false);
  const [geometryEdit, setGeometryEdit] = useState(geometry);
  const editRef = useRef();

  useEffect(() => {
    setGeometryEdit(editRef.current.innerText.replace("\n\n\n", "\n\n"));
  }, [editMode]);

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const restoreGeometry = () => {
    setGeometryEdit(geometry);
  };

  const submitUpdatedGeometry = () => {
    dispatch(
      actions.updateSpeciesGeometry({ id, connId, geometry: geometryEdit })
    );
    window.location.reload();
  };

  return (
    <div className="mb-6 flex flex-row flex-wrap gap-12 justify-center items-start">
      <ViewSpeciesFromXYZ
        id={`I${id}`}
        className="m-4 w-96"
        xyzString={geometryEdit}
      />
      <div className="w-min">
        <div className="flex flex-row justify-between">
          <div className="stat-title">Coordinates</div>
          <div className="flex gap-2">
            {geometry != geometryEdit && (
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
          {geometryEdit}
        </div>
      </div>
    </div>
  );
}
