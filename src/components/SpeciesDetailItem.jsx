import ViewSpeciesFromXYZ from "./ViewSpeciesFromXYZ";

export default function SpeciesDetailItem({ isomer }) {
  return (
    <div className="card flex flex-row flex-wrap justify-center items-center bg-base-100 shadow-xl">
      <figure className="px-10 pt-10">
        <ViewSpeciesFromXYZ
          id={`I${isomer.id}`}
          className="m-4 w-96"
          xyzString={isomer.geometry}
        />
      </figure>
      <div className="card-body items-center text-center">
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
      <div className="card-body items-center text-center">
        <div className="stats stats-vertical shadow">
          <div className="stat">
            <div className="stat-title">Coordinates</div>
            <div className="stat-value text-base whitespace-pre-wrap">{isomer.geometry}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
