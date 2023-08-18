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