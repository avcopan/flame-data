import SpeciesItem from "../components/SpeciesItem";

export default function CollectionsMenu({ collections }) {
  return (
    <aside className="sticky top-12 join join-vertical max-w-lg h-screen pb-24">
      {collections.map((collection, index) => (
        <div
          className="collapse join-item border border-primary"
          key={collection.id}
        >
          <input
            type="radio"
            name="my-accordion-2"
            defaultChecked={index === 0}
          />
          <div className="collapse-title text-xl text-primary font-medium">
            {collection.name}
          </div>
          <div className="collapse-content h-full flex flex-wrap justify-start overflow-auto">
            {collection.species &&
              collection.species.map((species) => (
                <SpeciesItem
                  key={species.conn_id}
                  species={species}
                  className="m-2 w-32"
                />
              ))}
          </div>
        </div>
      ))}
      <div className="flex flex-row justify-center items-center w-full outline outline-primary outline-1 rounded-t-none rounded-b-lg">
        <button className="grow btn rounded-none rounded-bl-lg">New Collection</button>
        <input
          type="text"
          placeholder="Enter name..."
          className="grow input rounded-none rounded-br-lg text-white input-bordered w-full max-w-xs"
        />
      </div>
    </aside>
  );
}
