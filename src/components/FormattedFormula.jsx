export default function FormattedFormula({ formula }) {
  return (
    <>
      {formula
        .split(/(\d+)/)
        .map((string) =>
          string.match(/^\d+$/) ? <sub>{string}</sub> : <>{string}</>
        )}
    </>
  );
}
