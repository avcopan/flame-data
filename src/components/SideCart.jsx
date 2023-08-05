export default function SideCart({ speciesHeader, speciesList, buttonText, buttonOnClick }) {
  return (
    <div className="h-full">
      <div className="pb-4 flex flex-col overflow-auto outline outline-1 outline-primary rounded-t-lg w-56">
        <div className="mb-4 p-4 border-b border-primary text-primary font-medium">
          {speciesHeader}
        </div>
        {speciesList.map((species, index) => (
          <div className="ml-4" key={index}>
            {species}
          </div>
        ))}
      </div>
      <button
        className="btn btn-primary w-full outline outline-primary outline-1 rounded-t-none rounded-b-lg"
        onClick={buttonOnClick}
      >
        {buttonText}
      </button>
    </div>
  );
}
