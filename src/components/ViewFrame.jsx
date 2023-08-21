export default function ViewFrame({
  children,
  withCheckbox = false,
  checked = false,
  checkHandler = () => {},
  className = "h-96 aspect-square",
  checkboxClassNames = "checkbox-primary checkbox-sm",
}) {
  className = `relative bg-white flex flex-col justify-center items-center rounded-3xl ${className}`;

  if (!className.includes("aspect")) {
    className += " aspect-square";
  }

  return (
    <div className={className}>
      {children}
      {withCheckbox && (
        <input
          readOnly
          type="checkbox"
          checked={checked}
          onClick={checkHandler}
          className={`checkbox absolute bottom-2 right-2 ${checkboxClassNames}`}
        />
      )}
    </div>
  );
}
