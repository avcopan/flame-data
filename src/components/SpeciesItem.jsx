import ViewSpecies2D from "./ViewSpecies2D";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

export default function SpeciesItem({ species, firstInGroup }) {
  return (
    <div>
      {firstInGroup && (
        <>
          <ChevronLeftIcon className="text-neutral rotate-45 h-6" />
          <div className="pl-6 text-neutral">{species.formula}</div>
        </>
      )}
      <ViewSpecies2D
        key={species.conn_id}
        svgString={species.svg_string}
        descriptors={[species.formula]}
        className="m-6 w-48"
      />
    </div>
  );
}
