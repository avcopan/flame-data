import axios from "axios";
import { useState } from "react";
import { useDispatch } from "react-redux";
import SpeciesItem from "./SpeciesItem";
import DeleteButton from "./DeleteButton";
import actions from "../state/actions";

/** Download data as a JSON file
 * https://theroadtoenterprise.com/blog/how-to-download-csv-and-json-files-in-react
 */
const downloadData = (data, name = "data") => {
  const blob = new Blob([JSON.stringify(data)], { type: "text/json" });
  const a = document.createElement("a");
  a.download = `${name.replace(/ /g, "_")}.json`;
  a.href = window.URL.createObjectURL(blob);
  const clickEvent = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
  });
  a.dispatchEvent(clickEvent);
  a.remove();
};

export default function CollectionsMenu({
  collections,
  selectedCollection,
  setSelectedCollection,
}) {
  const dispatch = useDispatch();
  const [newCollectionName, setNewCollectionName] = useState("");

  const toggleSelection = (id) => {
    return () => {
      setSelectedCollection(id);
    };
  };

  const postNewCollection = () => {
    const payload = { name: newCollectionName };
    dispatch(actions.postNewCollection(payload));
    setNewCollectionName("");
  };

  const deleteCollection = (collection) => {
    return () => {
      const payload = { coll_id: collection.id };
      dispatch(actions.deleteCollection(payload));
    };
  };

  const downloadCollection = (collection) => {
    return async () => {
      try {
        const res = await axios.get(`/api/collections/${collection.id}`);
        const data = await res.data;
        downloadData(data, collection.name);
      } catch (error) {
        alert("Something went wrong with the download...");
        console.error(error);
      }
    };
  };

  return (
    <aside className="sticky top-12 join join-vertical max-w-lg h-screen pb-24">
      {collections.map((collection) => (
        <div
          className="collapse join-item border border-primary"
          key={collection.id}
        >
          <input
            type="radio"
            name="my-accordion-2"
            checked={collection.id == selectedCollection}
            onChange={toggleSelection(collection.id)}
          />
          <div className="collapse-title flex flex-row justify-between text-xl text-primary font-medium">
            {collection.name}
          </div>
          <div className="collapse-content flex flex-col gap-4 justify-center items-center">
            <div className="flex flex-wrap justify-start overflow-auto">
              {collection.species &&
                collection.species.map((species) => (
                  <SpeciesItem
                    key={species.conn_id}
                    species={species}
                    className="m-2 w-32"
                  />
                ))}
            </div>
            <div className="w-full flex flex-row justify-between">
              {collection.species && collection.species.length > 0 && (
                <button
                  onClick={downloadCollection(collection)}
                  className="btn btn-outline btn-secondary"
                >
                  Download
                </button>
              )}
              <DeleteButton
                warningMessage={`Are you sure? This will remove '${collection.name}' from your collections.`}
                handleDelete={deleteCollection(collection)}
                id={collection.id}
              />
            </div>
          </div>
        </div>
      ))}
      <div className="flex flex-row justify-center items-center w-full outline outline-primary outline-1 rounded-t-none rounded-b-lg">
        <button
          onClick={postNewCollection}
          className="grow btn rounded-none rounded-bl-lg"
        >
          New Collection
        </button>
        <input
          type="text"
          placeholder="Enter name..."
          value={newCollectionName}
          onChange={(event) => setNewCollectionName(event.target.value)}
          className="grow input rounded-none rounded-br-lg text-white input-bordered w-full max-w-xs"
        />
      </div>
    </aside>
  );
}
