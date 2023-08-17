export default function ViewFrame({
  className,
  children,
  withCheckbox = false,
  checked = false,
  checkHandler = () => {},
  checkboxClassNames = "checkbox-primary checkbox-sm",
}) {
  return (
    <div
      className={`bg-white aspect-square flex flex-col justify-center items-center rounded-3xl ${className}`}
    >
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
