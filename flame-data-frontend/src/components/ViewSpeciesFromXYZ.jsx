import { useEffect } from "react";
import ViewFrame from "./ViewFrame";
import * as $3DMol from "3dmol";

export default function ViewSpeciesFromXYZ({
  xyzString,
  className = "",
  id = "species3DView",
}) {

  let view = $3DMol.createViewer(id, { minimumZoomToDistance: 3 });
  useEffect(() => {
    if (view) {
      console.log("Adding model with this string:");
      console.log(xyzString);
      view.addModel(xyzString, "xyz");
      view.setStyle({ stick: {}, sphere: { radius: 0.3 } });
      view.zoomTo();
      view.render();
    }
  }, [view]);
  return (
    <div>
      <ViewFrame className={className}>
        <div
          id={id}
          style={{ width: "23rem", height: "23rem", position: "relative" }}
        ></div>
      </ViewFrame>
    </div>
  );
}
