export const checkHandler = (id, selected, setSelected) => {
  return (event) => {
    event.stopPropagation();
    if (selected.includes(id)) {
      setSelected(selected.filter((i) => i !== id));
    } else {
      setSelected([...selected, id]);
    }
  };
};
