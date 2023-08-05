import SpeciesItem from "./SpeciesItem";

export default function SpeciesGroup({ speciesGroup }) {
  return (
    <>
      {speciesGroup.map((species, i) => (
        <SpeciesItem key={i} species={species} firstInGroup={i == 0} />
      ))}
    </>
  );
}
