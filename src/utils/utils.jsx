export function checkHandler(id, selected, setSelected) {
  return (event) => {
    event.stopPropagation();
    if (selected.includes(id)) {
      setSelected(selected.filter((i) => i !== id));
    } else {
      setSelected([...selected, id]);
    }
  };
}

export function textToggler(mode, trueTextDefault, falseTextDefault) {
  return (trueText = trueTextDefault, falseText = falseTextDefault) => {
    const text = mode ? trueText : falseText;
    return text;
  };
}

export function prettyReactionSmiles(smiles) {
  return smiles.replace(/\./g, " + ").replace(">>", " >> ");
}

export function capitalizeText(string) {
  return <span className="capitalize">{string}</span>;
}

export function formatFormula(formula) {
  return (
    <>
      {formula &&
        formula
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
