import { useSelector } from "react-redux";
import { prettyReactionSmiles } from "../utils/utils";
import DetailStats from "./DetailStats";
import DetailGeometry from "./DetailGeometry";

export default function DetailItem({
  detailItem,
  isomerIndex = 0,
  isomerCount = 1,
}) {
  const reactionMode = useSelector((store) => store.reactionMode);

  const statsList = [["AMChI", detailItem.amchi]];

  if (!reactionMode) {
    statsList.splice(0, 0, ["InChI", detailItem.inchi]);
  }

  if (isomerCount > 1) {
    const isomerStats = [
      ["Stereoisomer", `${isomerIndex + 1}/${isomerCount}`],
      ["SMILES", prettyReactionSmiles(detailItem.smiles)],
    ];
    statsList.splice(0, 0, ...isomerStats);
  }

  return (
    <div className="mb-6 card bg-base-100 shadow-2xl">
      <DetailStats
        statsObject={detailItem}
        statsList={statsList}
        containerClassName="mb-8"
        valueClassName="text-base overflow-x-auto"
      />
      <DetailGeometry
        geometry={detailItem.geometry}
        connId={detailItem.conn_id}
        id={detailItem.id}
      />
    </div>
  );
}
