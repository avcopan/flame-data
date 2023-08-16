export default function ViewFrame({
  className,
  children,
  withCheckbox = false,
  checked = false,
  checkHandler = () => {},
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
          className="checkbox checkbox-primary checkbox-sm relative bottom-0 right-2 self-end"
        />
      )}
    </div>
  );
}
