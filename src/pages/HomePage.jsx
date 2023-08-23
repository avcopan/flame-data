import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import actions from "../state/actions";
import ReactionModeSelector from "../components/ReactionModeSelector";
import BinarySelector from "../components/BinarySelector";
import DisplayList from "../components/DisplayList";
import CollectionsMenu from "../components/CollectionsMenu";
import PopupButton from "../components/PopupButton";

export default function HomePage() {
  const dispatch = useDispatch();
  const user = useSelector((store) => store.user);
  const collections = useSelector((store) => store.collections);
  const reactionMode = useSelector((store) => store.reactionMode);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [searchFormula, setSearchFormula] = useState("");
  const [searchPartial, setSearchPartial] = useState(false);

  const itemList = useSelector((store) =>
    reactionMode ? store.reactions : store.species
  );

  useEffect(() => {
    dispatch(actions.getReactions());
    dispatch(actions.getSpecies());
  }, []);

  useEffect(() => {
    if (user) {
      dispatch(actions.getCollections());
    }
  }, [user]);

  useEffect(() => {
    if (selectedCollection === null && collections.length > 0) {
      setSelectedCollection(collections[0].id);
    }
  }, [collections]);

  const submitSearch = () => {
    const payload = { formula: searchFormula, partial: searchPartial };
    dispatch(
      reactionMode ? actions.getReactions(payload) : actions.getSpecies(payload)
    );
    setSearchFormula("");
  };

  const addItemsToCollection = () => {
    const payload = {
      coll_id: selectedCollection,
      conn_ids: selectedItems,
    };
    dispatch(actions.postCollectionItems(payload));
    setSelectedItems([]);
  };

  return (
    <div className="flex flex-col gap-6 justify-center items-center">
      <ReactionModeSelector />
      <div className="flex flex-row gap-6 mb-12">
        <div className="w-96 flex flex-col gap-6">
          <input
            type="text"
            spellCheck={false}
            placeholder="Search by formula..."
            className="input input-bordered w-full max-w-xl mr-2"
            value={searchFormula}
            onChange={(e) => setSearchFormula(e.target.value)}
          />
          <BinarySelector
            text1="Partial match"
            text2="Exact match"
            selection={searchPartial}
            setSelection={setSearchPartial}
          />
        </div>
        <button className="btn btn-outline" onClick={submitSearch}>
          Search
        </button>
      </div>
      <div className="flex flex-row justify-center gap-12 items-start">
        <DisplayList
          itemList={itemList}
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          className={user ? "w-2/3" : "w-full"}
        />
        {user && (
          <CollectionsMenu
            collections={collections}
            selectedCollection={selectedCollection}
            setSelectedCollection={setSelectedCollection}
          />
        )}
        <PopupButton
          condition={selectedItems.length > 0}
          text="Add to Collection"
          onClick={addItemsToCollection}
        />
      </div>
    </div>
  );
}
