export default function ViewFrame({
  children,
  withCheckbox = false,
  checked = false,
  checkHandler = () => {},
  className = "h-96 aspect-square",
  checkboxClassNames = "checkbox-primary checkbox-sm",
}) {
  className = `bg-white flex flex-col justify-center items-center rounded-3xl ${className}`;

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
          className={`checkbox relative bottom-0 right-2 self-end ${checkboxClassNames}`}
        />
      )}
    </div>
  );
}
