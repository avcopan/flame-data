export default function ViewSpecies2D({ svgString, stringList, className }) {
  return (
    <div
      className={`bg-white aspect-square flex flex-col justify-center items-center rounded-3xl ${className}`}
    >
      {svgString && (
        <>
          <img
            className="w-full"
            src={`data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`}
          />
          {stringList.map((string, idx) => (
            <span key={idx}>{string}</span>
          ))}
        </>
      )}
    </div>
  );
}
