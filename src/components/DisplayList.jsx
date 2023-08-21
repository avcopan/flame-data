import { useSelector } from "react-redux";
import { checkHandler } from "../utils/utils";
import DisplayItem from "./DisplayItem";

export default function DisplayList({
  itemList,
  selectedItems,
  setSelectedItems,
  reactionMode,
  className = "",
}) {
  const user = useSelector((store) => store.user);
  let itemListWithGroupIndicator = [];
  let last_formula = "";

  for (const item of itemList) {
    itemListWithGroupIndicator.push([item, item.formula !== last_formula]);
    last_formula = item.formula;
  }

  return (
    <div
      className={`flex flex-wrap gap-8 justify-start items-end pb-24 ${className}`}
    >
      {itemListWithGroupIndicator.map(([item, firstInGroup], index) => (
        <DisplayItem
          item={item}
          firstInGroup={firstInGroup}
          reactionMode={reactionMode}
          key={index}
          withCheckbox={user}
          checked={selectedItems.includes(item.id)}
          checkHandler={checkHandler(item.id, selectedItems, setSelectedItems)}
        />
      ))}
    </div>
  );
}
