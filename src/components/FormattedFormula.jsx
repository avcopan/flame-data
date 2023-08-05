export default function FormattedFormula({ formula }) {
  return (
    <>
      {formula
        .split(/(\d+)/)
        .map((string, i) =>
          string.match(/^\d+$/) ? (
            <sub key={i}>{string}</sub>
          ) : (
            <span key={i}>{string}</span>
          )
        )}
    </>
  );
}
