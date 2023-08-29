import { useSelector } from "react-redux";
import { prettyReactionSmiles, capitalizeText } from "../utils/utils";
import DetailStats from "./DetailStats";
import DetailGeometry from "./DetailGeometry";

export default function DetailItem({
  detailItem,
  isomerIndex = 0,
  isomerCount = 1,
}) {
  const reactionMode = useSelector((store) => store.reactionMode);
  const tsCount = reactionMode ? detailItem.geometries.length : undefined;

  // Build up the stats list for this particular instance
  const statsList = [];

  if (isomerCount > 1) {
    statsList.push(
      ["Stereoisomer", `${isomerIndex + 1}/${isomerCount}`],
      ["SMILES", prettyReactionSmiles(detailItem.smiles)]
    );
  }

  if (!reactionMode) {
    statsList.push(["InChI", detailItem.inchi], ["AMChI", detailItem.amchi]);
  }

  if (tsCount === 1) {
    statsList.push(
      ["TS Type", detailItem.classes[0], capitalizeText],
      ["TS AMChI", detailItem.amchis[0]]
    );
  }

  return (
    <div className="mb-6 card bg-base-100 shadow-2xl">
      <DetailStats
        statsList={statsList}
        containerClassName="mb-6"
        valueClassName="text-base font-normal overflow-x-auto"
      />
      {reactionMode ? (
        tsCount > 1 ? (
          detailItem.geometries.map((geometry, index) => (
            <>
              <DetailStats
                statsList={[
                  ["TS Structure", `${index + 1}/${tsCount}`],
                  ["TS Type", detailItem.classes[index], capitalizeText],
                  ["TS AMChI", detailItem.amchis[index]],
                ]}
                containerClassName="mb-2 ml-16"
                valueClassName="text-base font-normal overflow-x-auto"
              />
              <DetailGeometry
                geometry={geometry}
                connId={detailItem.conn_id}
                id={detailItem.ts_ids[index]}
              />
            </>
          ))
        ) : (
          <DetailGeometry
            geometry={detailItem.geometries[0]}
            connId={detailItem.conn_id}
            id={detailItem.ts_ids[0]}
          />
        )
      ) : (
        <DetailGeometry
          geometry={detailItem.geometry}
          connId={detailItem.conn_id}
          id={detailItem.id}
        />
      )}
    </div>
  );
}
