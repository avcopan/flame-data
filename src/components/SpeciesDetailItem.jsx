import ViewSpeciesFromXYZ from "./ViewSpeciesFromXYZ";

export default function SpeciesDetailItem({ isomer }) {
  return (
    <div className="card flex flex-row flex-wrap justify-center items-center bg-base-100 shadow-xl">
      <figure className="px-10 pt-10">
        <ViewSpeciesFromXYZ id={`I${isomer.id}`} className="m-4 w-96" xyzString={isomer.geometry} />
      </figure>
      <div className="card-body items-center text-center">
        <h2 className="card-title">Shoes!</h2>
        <p>If a dog chews shoes whose shoes does he choose?</p>
        <div className="card-actions">
          <button className="btn btn-primary">Buy Now</button>
        </div>
      </div>
    </div>
  );
}
